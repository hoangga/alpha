import 'dart:math' as math;
import 'dart:ui' hide TextStyle;

import 'package:flame/components.dart';
import 'package:flame/events.dart';
import 'package:flame/game.dart';
import 'package:flutter/painting.dart' show TextStyle, FontWeight;

import 'state.dart';

enum TableStatus { empty, waiting, cooking, ready, eating }

class RestaurantGame extends FlameGame {
  RestaurantGame(this.state);

  final GameState state;
  final _rng = math.Random();
  final List<TableComponent> tables = [];
  double _spawnTimer = 2;

  @override
  Color backgroundColor() => const Color(0xFFF3E3C3);

  @override
  Future<void> onLoad() async {
    for (var i = 0; i < maxTables; i++) {
      final t = TableComponent(i);
      tables.add(t);
      world.add(t);
    }
    camera.viewfinder.anchor = Anchor.topLeft;
    state.addListener(_layout);
    _layout();
  }

  @override
  void onRemove() {
    state.removeListener(_layout);
    super.onRemove();
  }

  @override
  void onGameResize(Vector2 size) {
    super.onGameResize(size);
    if (isLoaded) _layout();
  }

  void _layout() {
    const cols = 2;
    final rows = (maxTables / cols).ceil();
    final cellW = size.x / cols;
    final cellH = (size.y - 70) / rows;
    for (final t in tables) {
      t.cell = Vector2(cellW, cellH);
      t.position = Vector2((t.index % cols) * cellW, 70 + (t.index ~/ cols) * cellH);
      t.size = t.cell;
    }
  }

  @override
  void update(double dt) {
    super.update(dt);
    _spawnTimer -= dt;
    if (_spawnTimer <= 0) {
      _spawnTimer = state.spawnSeconds * (0.7 + _rng.nextDouble() * 0.6);
      final free = tables.where((t) => t.index < state.tables && t.status == TableStatus.empty).toList();
      if (free.isNotEmpty) {
        free[_rng.nextInt(free.length)].seat(_rng.nextInt(state.unlockedDishes));
      }
    }
  }

  @override
  void render(Canvas canvas) {
    super.render(canvas);
    // Door strip + decoration shelf along the top.
    canvas.drawRect(Rect.fromLTWH(0, 0, size.x, 70), Paint()..color = const Color(0xFF8D5A34));
    final door = Rect.fromLTWH(12, 12, 46, 58);
    canvas.drawRRect(RRect.fromRectAndRadius(door, const Radius.circular(8)), Paint()..color = const Color(0xFF5B3920));
    _label(canvas, '🚪', const Offset(21, 24), 28);
    var x = 76.0;
    for (final item in decorItems) {
      final owned = state.decor.contains(item.id);
      _label(canvas, owned ? item.icon : '·', Offset(x, 22), owned ? 28 : 18, opacity: owned ? 1 : 0.35);
      x += 42;
    }
  }

  void floatText(String text, Vector2 at, Color color) {
    world.add(_FloatingText(text, at, color));
  }
}

void _label(Canvas canvas, String text, Offset at, double fontSize, {double opacity = 1, Color? color}) {
  final p = ParagraphBuilder(ParagraphStyle(textAlign: TextAlign.left))
    ..pushStyle(TextStyle(fontSize: fontSize, color: (color ?? const Color(0xFF000000)).withValues(alpha: opacity)).getTextStyle())
    ..addText(text);
  final para = p.build()..layout(const ParagraphConstraints(width: 400));
  canvas.drawParagraph(para, at);
}

class TableComponent extends PositionComponent with TapCallbacks, HasGameReference<RestaurantGame> {
  TableComponent(this.index);

  final int index;
  Vector2 cell = Vector2.zero();
  TableStatus status = TableStatus.empty;
  int dish = 0;
  double patience = 1; // 1 -> 0
  double progress = 0; // cooking / eating
  double _auto = 0;
  double _arrive = 0; // 0..1 slide-in animation of the guest
  int _guest = 0;
  static const _faces = ['😀', '🙂', '😋', '🧑', '👩', '👨', '🧓'];

  GameState get state => game.state;
  bool get unlocked => index < state.tables;

  void seat(int dishIndex) {
    status = TableStatus.waiting;
    dish = dishIndex;
    patience = 1;
    progress = 0;
    _auto = 0;
    _arrive = 0;
    _guest = math.Random().nextInt(_faces.length);
  }

  void _clear() {
    status = TableStatus.empty;
    progress = 0;
  }

  void interact() {
    switch (status) {
      case TableStatus.waiting:
        status = TableStatus.cooking;
        progress = 0;
        patience = math.min(1, patience + 0.3);
      case TableStatus.ready:
        status = TableStatus.eating;
        progress = 0;
      default:
        return;
    }
    _auto = 0;
  }

  @override
  void onTapDown(TapDownEvent event) {
    if (unlocked) interact();
  }

  @override
  void update(double dt) {
    if (!unlocked || status == TableStatus.empty) return;
    if (_arrive < 1) _arrive = math.min(1, _arrive + dt * 2);
    switch (status) {
      case TableStatus.waiting:
      case TableStatus.ready:
        // Waiting for food is more forgiving than waiting to order.
        patience -= dt / (status == TableStatus.waiting ? 18 : 25);
        if (patience <= 0) {
          state.customerLeft();
          game.floatText('😠', absoluteCenter, const Color(0xFFB02C3C));
          _clear();
          return;
        }
        final delay = state.waiterDelay;
        if (delay != null) {
          _auto += dt;
          if (_auto >= delay) interact();
        }
      case TableStatus.cooking:
        progress += dt / state.cookSeconds;
        if (progress >= 1) {
          status = TableStatus.ready;
          progress = 0;
          _auto = 0;
        }
      case TableStatus.eating:
        progress += dt / 3;
        if (progress >= 1) {
          final pay = state.payment(dish);
          state.earn(pay);
          game.floatText('+${pay.round()}🪙', absoluteCenter, const Color(0xFF0C7B56));
          _clear();
        }
      case TableStatus.empty:
        break;
    }
  }

  @override
  void render(Canvas canvas) {
    final c = Offset(cell.x / 2, cell.y / 2 + 8);
    final w = math.min(cell.x * 0.55, 120.0);
    final tableRect = Rect.fromCenter(center: c, width: w, height: w * 0.6);

    if (!unlocked) {
      canvas.drawRRect(
          RRect.fromRectAndRadius(tableRect, const Radius.circular(14)), Paint()..color = const Color(0x33000000));
      _label(canvas, '🔒', c.translate(-12, -14), 26, opacity: 0.6);
      return;
    }

    canvas.drawRRect(RRect.fromRectAndRadius(tableRect, const Radius.circular(14)),
        Paint()..color = const Color(0xFFB77A45));
    canvas.drawRRect(
        RRect.fromRectAndRadius(tableRect.deflate(5), const Radius.circular(10)), Paint()..color = const Color(0xFFD9A066));

    if (status == TableStatus.empty) return;

    // Guest slides in from the left (the door side).
    final ease = Curves01.easeOut(_arrive);
    final gx = lerpDouble(-cell.x * 0.3, tableRect.center.dx, ease)!;
    _label(canvas, _faces[_guest], Offset(gx - 16, tableRect.top - 40), 32);

    // Speech bubble.
    final bubble = RRect.fromRectAndRadius(
        Rect.fromCenter(center: Offset(tableRect.center.dx, tableRect.top - 62), width: 64, height: 34),
        const Radius.circular(12));
    canvas.drawRRect(bubble, Paint()..color = const Color(0xFFFFFFFF));
    final icon = switch (status) {
      TableStatus.waiting => dishes[dish].icon,
      TableStatus.cooking => '🍳',
      TableStatus.ready => '🛎️',
      _ => '😋',
    };
    _label(canvas, icon, Offset(bubble.left + 20, bubble.top + 2), 24);

    // Progress / patience bar under the table.
    final bar = Rect.fromLTWH(tableRect.left, tableRect.bottom + 8, tableRect.width, 8);
    canvas.drawRRect(RRect.fromRectAndRadius(bar, const Radius.circular(4)), Paint()..color = const Color(0x33000000));
    final showProgress = status == TableStatus.cooking || status == TableStatus.eating;
    final frac = showProgress ? progress : patience;
    final color = showProgress
        ? const Color(0xFF2E86DE)
        : Color.lerp(const Color(0xFFB02C3C), const Color(0xFF0C7B56), patience.clamp(0, 1))!;
    canvas.drawRRect(
        RRect.fromRectAndRadius(Rect.fromLTWH(bar.left, bar.top, bar.width * frac.clamp(0, 1), bar.height), const Radius.circular(4)),
        Paint()..color = color);
  }
}

class Curves01 {
  static double easeOut(double t) => 1 - (1 - t) * (1 - t);
}

class _FloatingText extends TextComponent {
  _FloatingText(String text, Vector2 at, Color color)
      : super(
          text: text,
          position: at.clone(),
          anchor: Anchor.center,
          priority: 10,
          textRenderer: TextPaint(style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: color)),
        );

  double _life = 0;

  @override
  void update(double dt) {
    _life += dt;
    position.y -= 40 * dt;
    if (_life > 1.1) removeFromParent();
  }
}

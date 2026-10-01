import 'dart:convert';
import 'dart:math' as math;

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

const dishes = <({String icon, String name, int price})>[
  (icon: '🍜', name: 'Phở', price: 10),
  (icon: '🥪', name: 'Bánh mì', price: 16),
  (icon: '🍔', name: 'Burger', price: 25),
  (icon: '🍕', name: 'Pizza', price: 40),
  (icon: '🍣', name: 'Sushi', price: 65),
  (icon: '🥩', name: 'Bít tết', price: 100),
];

const maxTables = 6;
const maxOfflineSeconds = 8 * 3600;

class DecorItem {
  const DecorItem(this.id, this.icon, this.name, this.cost, this.tipBonus, this.spawnBonus);
  final String id;
  final String icon;
  final String name;
  final int cost;

  /// Extra fraction added to every payment (0.05 = +5%).
  final double tipBonus;

  /// Fraction by which customers arrive faster.
  final double spawnBonus;
}

const decorItems = <DecorItem>[
  DecorItem('plant', '🪴', 'Chậu cây', 150, 0.05, 0.00),
  DecorItem('lamp', '💡', 'Đèn trang trí', 400, 0.00, 0.08),
  DecorItem('carpet', '🟥', 'Thảm đỏ', 900, 0.10, 0.00),
  DecorItem('aquarium', '🐠', 'Bể cá', 2200, 0.10, 0.10),
  DecorItem('piano', '🎹', 'Đàn piano', 6000, 0.20, 0.10),
  DecorItem('chandelier', '🔮', 'Đèn chùm', 15000, 0.25, 0.15),
];

class GameState extends ChangeNotifier {
  double coins = 50;
  int served = 0;
  int lost = 0;
  double rating = 3.0;
  int tables = 2;
  int menuLevel = 0; // unlocks dishes and raises prices
  int chefLevel = 0; // cooking speed
  int waiterLevel = 0; // 0 = none; auto takes orders and serves
  final Set<String> decor = {};
  DateTime lastSeen = DateTime.now();

  /// Coins earned while the app was closed; shown once on launch.
  double pendingOfflineEarnings = 0;

  int get unlockedDishes => math.min(menuLevel + 1, dishes.length);
  double get priceFactor => 1 + menuLevel * 0.35;
  double get tipBonus => decor.fold(0.0, (s, id) => s + _decor(id).tipBonus);
  double get spawnBonus => decor.fold(0.0, (s, id) => s + _decor(id).spawnBonus);
  double get ratingFactor => 1 + (rating - 3) * 0.1;

  double get cookSeconds => 6 / (1 + chefLevel * 0.3);
  double get spawnSeconds => math.max(1.5, 6 / (1 + spawnBonus + (rating - 3) * 0.1));

  /// Delay before a waiter reacts to a table; null when no waiter is hired.
  double? get waiterDelay => waiterLevel == 0 ? null : 2.5 / (1 + (waiterLevel - 1) * 0.35);

  double payment(int dish) =>
      dishes[dish].price * priceFactor * (1 + tipBonus) * ratingFactor;

  /// Passive coins per second used for offline progress.
  double get idleRate {
    final staff = chefLevel + waiterLevel * 2;
    if (staff == 0) return 0;
    final avgPrice = dishes.take(unlockedDishes).map((d) => d.price).reduce((a, b) => a + b) / unlockedDishes;
    return staff * avgPrice * priceFactor * (1 + tipBonus) * 0.03 * math.sqrt(tables);
  }

  DecorItem _decor(String id) => decorItems.firstWhere((d) => d.id == id);

  // Costs grow geometrically per level.
  int get tableCost => (120 * math.pow(2.6, tables - 2)).round();
  int get menuCost => (200 * math.pow(2.4, menuLevel)).round();
  int get chefCost => (80 * math.pow(1.7, chefLevel)).round();
  int get waiterCost => (250 * math.pow(2.0, waiterLevel)).round();

  bool get tablesMaxed => tables >= maxTables;
  bool get menuMaxed => menuLevel >= dishes.length - 1;
  bool get chefMaxed => chefLevel >= 10;
  bool get waiterMaxed => waiterLevel >= 5;

  bool _spend(int cost) {
    if (coins < cost) return false;
    coins -= cost;
    return true;
  }

  void earn(double amount) {
    coins += amount;
    served++;
    rating = math.min(5, rating + 0.03);
    _changed();
  }

  void customerLeft() {
    lost++;
    rating = math.max(1, rating - 0.15);
    _changed();
  }

  bool buyTable() {
    if (tablesMaxed || !_spend(tableCost)) return false;
    tables++;
    _changed();
    return true;
  }

  bool buyMenu() {
    if (menuMaxed || !_spend(menuCost)) return false;
    menuLevel++;
    _changed();
    return true;
  }

  bool buyChef() {
    if (chefMaxed || !_spend(chefCost)) return false;
    chefLevel++;
    _changed();
    return true;
  }

  bool buyWaiter() {
    if (waiterMaxed || !_spend(waiterCost)) return false;
    waiterLevel++;
    _changed();
    return true;
  }

  bool buyDecor(DecorItem item) {
    if (decor.contains(item.id) || !_spend(item.cost)) return false;
    decor.add(item.id);
    _changed();
    return true;
  }

  void _changed() {
    notifyListeners();
    save();
  }

  /// Credits idle earnings for [away] time and returns the amount.
  double applyOffline(Duration away) {
    final secs = math.min(away.inSeconds, maxOfflineSeconds);
    final gain = secs <= 60 ? 0.0 : secs * idleRate;
    coins += gain;
    pendingOfflineEarnings = gain;
    return gain;
  }

  void clearOfflineNotice() {
    pendingOfflineEarnings = 0;
    notifyListeners();
  }

  Map<String, Object> toJson() => {
        'coins': coins,
        'served': served,
        'lost': lost,
        'rating': rating,
        'tables': tables,
        'menu': menuLevel,
        'chef': chefLevel,
        'waiter': waiterLevel,
        'decor': decor.toList(),
        'seen': DateTime.now().millisecondsSinceEpoch,
      };

  void loadJson(Map<String, dynamic> j) {
    coins = (j['coins'] as num?)?.toDouble() ?? coins;
    served = (j['served'] as num?)?.toInt() ?? 0;
    lost = (j['lost'] as num?)?.toInt() ?? 0;
    rating = (j['rating'] as num?)?.toDouble() ?? 3;
    tables = ((j['tables'] as num?)?.toInt() ?? 2).clamp(2, maxTables);
    menuLevel = ((j['menu'] as num?)?.toInt() ?? 0).clamp(0, dishes.length - 1);
    chefLevel = (j['chef'] as num?)?.toInt() ?? 0;
    waiterLevel = (j['waiter'] as num?)?.toInt() ?? 0;
    decor
      ..clear()
      ..addAll(((j['decor'] as List?) ?? const []).cast<String>().where((id) => decorItems.any((d) => d.id == id)));
    final seen = (j['seen'] as num?)?.toInt();
    lastSeen = seen == null ? DateTime.now() : DateTime.fromMillisecondsSinceEpoch(seen);
  }

  static const _key = 'restaurant_save_v1';

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_key);
    if (raw == null) return;
    try {
      loadJson(Map<String, dynamic>.from(_decodeJson(raw)));
      applyOffline(DateTime.now().difference(lastSeen));
    } catch (_) {
      // Corrupt save: start fresh rather than crash.
    }
    notifyListeners();
  }

  Future<void> save() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key, _encodeJson(toJson()));
  }
}

dynamic _decodeJson(String s) => jsonDecode(s);
String _encodeJson(Object o) => jsonEncode(o);

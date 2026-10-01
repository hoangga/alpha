import 'package:flame_test/flame_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:restaurant_tycoon/game/restaurant_game.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:restaurant_tycoon/game/state.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  setUp(() => SharedPreferences.setMockInitialValues({}));

  test('purchases spend coins and respect limits', () {
    final s = GameState()..coins = 1e9;
    expect(s.buyTable(), isTrue);
    expect(s.tables, 3);
    while (!s.tablesMaxed) {
      s.buyTable();
    }
    expect(s.buyTable(), isFalse);
    expect(s.tables, maxTables);
    expect(s.buyDecor(decorItems.first), isTrue);
    expect(s.buyDecor(decorItems.first), isFalse);
  });

  test('cannot buy without enough coins', () {
    final s = GameState()..coins = 1;
    expect(s.buyChef(), isFalse);
    expect(s.chefLevel, 0);
  });

  test('offline earnings only with staff and are capped', () {
    final s = GameState()..coins = 0;
    expect(s.applyOffline(const Duration(hours: 2)), 0);
    s.waiterLevel = 1;
    final capped = s.applyOffline(const Duration(days: 3));
    expect(capped, closeTo(maxOfflineSeconds * s.idleRate, 0.001));
  });

  test('offline time is credited only once', () {
    final s = GameState()
      ..coins = 0
      ..waiterLevel = 1;
    final first = s.applyOffline(const Duration(hours: 1));
    expect(first, greaterThan(0));
    expect(DateTime.now().difference(s.lastSeen).inSeconds, lessThan(2));
  });

  test('save round-trips', () {
    final a = GameState()
      ..coins = 77
      ..tables = 4
      ..decor.add('lamp');
    final b = GameState()..loadJson(a.toJson());
    expect(b.coins, 77);
    expect(b.tables, 4);
    expect(b.decor, {'lamp'});
  });
  testWithGame<RestaurantGame>(
    'customer is seated, served and pays',
    () => RestaurantGame(GameState()),
    (game) async {
      final t = game.tables.first..seat(0);
      t.interact();
      expect(t.status, TableStatus.cooking);
      game.update(7);
      expect(t.status, TableStatus.ready);
      t.interact();
      final before = game.state.coins;
      game.update(3.1);
      expect(game.state.coins, greaterThan(before));
      expect(t.status, TableStatus.empty);
    },
  );
}

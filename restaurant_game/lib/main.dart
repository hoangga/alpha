import 'package:flame/game.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'game/restaurant_game.dart';
import 'game/state.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  final state = GameState();
  await state.load();
  runApp(RestaurantApp(state: state));
}

class RestaurantApp extends StatelessWidget {
  const RestaurantApp({super.key, required this.state});
  final GameState state;

  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'Nhà Hàng Triệu Phú',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(colorSchemeSeed: const Color(0xFFD9822B), useMaterial3: true),
        home: GameScreen(state: state),
      );
}

class GameScreen extends StatefulWidget {
  const GameScreen({super.key, required this.state});
  final GameState state;

  @override
  State<GameScreen> createState() => _GameScreenState();
}

class _GameScreenState extends State<GameScreen> with WidgetsBindingObserver {
  late final RestaurantGame game = RestaurantGame(widget.state);

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    WidgetsBinding.instance.addPostFrameCallback((_) => _maybeShowOffline());
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState s) {
    if (s == AppLifecycleState.paused || s == AppLifecycleState.inactive) {
      widget.state.save();
    } else if (s == AppLifecycleState.resumed) {
      final away = DateTime.now().difference(widget.state.lastSeen);
      widget.state.applyOffline(away);
      _maybeShowOffline();
    }
  }

  void _maybeShowOffline() {
    final gain = widget.state.pendingOfflineEarnings;
    if (gain < 1 || !mounted) return;
    widget.state.clearOfflineNotice();
    showDialog<void>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Chào mừng trở lại! 👋'),
        content: Text('Nhân viên đã kiếm được ${gain.round()} 🪙 trong lúc bạn vắng mặt.'),
        actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('Nhận'))],
      ),
    );
  }

  void _openShop() {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (_) => ShopSheet(state: widget.state),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(children: [
        Positioned.fill(child: GameWidget(game: game)),
        SafeArea(
          child: ListenableBuilder(
            listenable: widget.state,
            builder: (_, _) => Padding(
              padding: const EdgeInsets.all(8),
              child: Row(children: [
                _Chip('🪙 ${widget.state.coins.floor()}'),
                const SizedBox(width: 6),
                _Chip('⭐ ${widget.state.rating.toStringAsFixed(1)}'),
                const SizedBox(width: 6),
                _Chip('🍽️ ${widget.state.served}'),
              ]),
            ),
          ),
        ),
      ]),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openShop,
        icon: const Icon(Icons.storefront),
        label: const Text('Cửa hàng'),
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip(this.text);
  final String text;
  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.9), borderRadius: BorderRadius.circular(20)),
        child: Text(text, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.black87)),
      );
}

class ShopSheet extends StatelessWidget {
  const ShopSheet({super.key, required this.state});
  final GameState state;

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: SizedBox(
        height: MediaQuery.of(context).size.height * 0.6,
        child: ListenableBuilder(
          listenable: state,
          builder: (_, _) => Column(children: [
            Text('🪙 ${state.coins.floor()}', style: Theme.of(context).textTheme.titleLarge),
            const TabBar(tabs: [Tab(text: 'Nâng cấp'), Tab(text: 'Nhân viên'), Tab(text: 'Trang trí')]),
            Expanded(
              child: TabBarView(children: [
                ListView(children: [
                  _tile('🪑', 'Thêm bàn', 'Bàn ${state.tables}/$maxTables', state.tableCost, state.tablesMaxed, state.buyTable),
                  _tile(dishes[state.unlockedDishes - 1].icon, 'Thực đơn',
                      'Cấp ${state.menuLevel + 1}: mở món mới, giá cao hơn', state.menuCost, state.menuMaxed, state.buyMenu),
                ]),
                ListView(children: [
                  _tile('👨‍🍳', 'Đầu bếp', 'Cấp ${state.chefLevel}: nấu nhanh hơn', state.chefCost, state.chefMaxed, state.buyChef),
                  _tile('🧑‍💼', 'Phục vụ', 'Cấp ${state.waiterLevel}: tự nhận order & phục vụ (kiếm tiền cả khi offline)',
                      state.waiterCost, state.waiterMaxed, state.buyWaiter),
                ]),
                ListView(children: [
                  for (final d in decorItems)
                    _tile(d.icon, d.name, '+${(d.tipBonus * 100).round()}% tiền, +${(d.spawnBonus * 100).round()}% khách',
                        d.cost, state.decor.contains(d.id), () => state.buyDecor(d), ownedLabel: 'Đã có'),
                ]),
              ]),
            ),
          ]),
        ),
      ),
    );
  }

  Widget _tile(String icon, String title, String sub, int cost, bool done, bool Function() buy, {String ownedLabel = 'Tối đa'}) {
    return ListTile(
      leading: Text(icon, style: const TextStyle(fontSize: 30)),
      title: Text(title),
      subtitle: Text(sub),
      trailing: done
          ? Text(ownedLabel)
          : FilledButton(onPressed: state.coins >= cost ? buy : null, child: Text('$cost 🪙')),
    );
  }
}

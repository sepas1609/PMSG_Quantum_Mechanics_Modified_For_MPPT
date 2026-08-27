mdl = 'test_bridge_mdl';
new_system(mdl);
load_system('powerlib');
add_block('powerlib/Power Electronics/Universal Bridge', [mdl '/Rectifier']);
names = get_param([mdl '/Rectifier'], 'DialogParameters');
disp(fieldnames(names));
exit;

mdl = 'test_pmsg_mdl';
new_system(mdl);
load_system('powerlib');
add_block('powerlib/Machines/Permanent Magnet Synchronous Machine', [mdl '/PMSG']);
names = get_param([mdl '/PMSG'], 'DialogParameters');
disp(fieldnames(names));
exit;

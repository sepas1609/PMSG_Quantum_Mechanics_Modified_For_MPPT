mdl = 'test_ports_mdl';
new_system(mdl);
load_system('powerlib');
add_block('powerlib/Machines/Permanent Magnet Synchronous Machine', [mdl '/PMSG']);
ph = get_param([mdl '/PMSG'], 'PortHandles');
disp('PMSG LConn:'); disp(length(ph.LConn));
disp('PMSG RConn:'); disp(length(ph.RConn));
exit;

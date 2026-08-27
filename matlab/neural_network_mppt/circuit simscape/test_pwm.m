load_system('powerlib');
blks = find_system('powerlib', 'Name', 'PWM Generator');
disp(blks);
blks2 = find_system('powerlib', 'Name', 'PWM Generator (DC-DC)');
disp(blks2);
exit;

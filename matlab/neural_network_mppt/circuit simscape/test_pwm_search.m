load_system('powerlib');
blks = find_system('powerlib', 'RegExp', 'on', 'Name', 'PWM');
disp(blks);
exit;

import re

with open('build_simscape_circuit_v2.m', 'r') as f:
    code = f.read()

# Add C_in
cin_block = """
    % Add DC Link Capacitor to prevent inductive kickback from 3-Phase Source
    add_block('powerlib/Elements/Series RLC Branch', [mdl '/C_in'], 'Position', [250 150 270 210], 'Orientation', 'down');
    set_param([mdl '/C_in'], 'BranchType', 'RC', 'Resistance', '0.01', 'Capacitance', '1e-3');
"""

# Insert it before L1 block creation
code = code.replace("    add_block('powerlib/Elements/Series RLC Branch', [mdl '/L1']", cin_block + "    add_block('powerlib/Elements/Series RLC Branch', [mdl '/L1']")

# Connect C_in
cin_connect = """
    % Connect C_in across rectifier output
    add_line(mdl, ph_rect.RConn(1), get_param([mdl '/C_in'], 'PortHandles').LConn(1));
    add_line(mdl, get_param([mdl '/C_in'], 'PortHandles').RConn(1), ph_GND.LConn(1));
"""

# Insert it after V_measure connections
code = code.replace("    add_line(mdl, ph_rect.RConn(2), get_param([mdl '/V_measure'], 'PortHandles').LConn(2));", 
                    "    add_line(mdl, ph_rect.RConn(2), get_param([mdl '/V_measure'], 'PortHandles').LConn(2));" + cin_connect)

with open('build_simscape_circuit_v2.m', 'w') as f:
    f.write(code)


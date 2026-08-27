import re

with open('build_simscape_circuit_v2.m', 'r') as f:
    code = f.read()

rsource_block = """
    % Add Internal Resistance to DC Source so MPPT can actually find a Peak Power Point
    add_block('powerlib/Elements/Series RLC Branch', [mdl '/R_source'], 'Position', [150 50 170 80], 'Orientation', 'up');
    set_param([mdl '/R_source'], 'BranchType', 'R', 'Resistance', '5');
"""

# Insert R_source before QBC components
code = code.replace("    %% 5. Quadratic Boost Converter Components", rsource_block + "\n    %% 5. Quadratic Boost Converter Components")

# Change Rectifier + connection to go through R_source
# Currently: ph_rect = get_param([mdl '/Rectifier'], 'PortHandles');
# Then later:
# add_line(mdl, ph_rect.RConn(1), get_param([mdl '/V_measure'], 'PortHandles').LConn(1));
# add_line(mdl, ph_rect.RConn(1), get_param([mdl '/I_measure'], 'PortHandles').LConn(1));

# We want Rectifier + -> R_source -> Node B.
# Node B connects to V_measure+ and I_measure+.

# Replace connections
code = code.replace(
    "add_line(mdl, ph_rect.RConn(1), get_param([mdl '/V_measure'], 'PortHandles').LConn(1));",
    "add_line(mdl, ph_rect.RConn(1), get_param([mdl '/R_source'], 'PortHandles').LConn(1));\n    add_line(mdl, get_param([mdl '/R_source'], 'PortHandles').RConn(1), get_param([mdl '/V_measure'], 'PortHandles').LConn(1));"
)
code = code.replace(
    "add_line(mdl, ph_rect.RConn(1), get_param([mdl '/I_measure'], 'PortHandles').LConn(1));",
    "add_line(mdl, get_param([mdl '/R_source'], 'PortHandles').RConn(1), get_param([mdl '/I_measure'], 'PortHandles').LConn(1));"
)

with open('build_simscape_circuit_v2.m', 'w') as f:
    f.write(code)


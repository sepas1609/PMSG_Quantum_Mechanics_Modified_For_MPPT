import re

with open('build_simscape_circuit_v2.m', 'r') as f:
    code = f.read()

# Replace ph_rect.RConn(2) with ph_rect.LConn(1) because DC Source uses LConn for negative
code = code.replace("ph_rect.RConn(2)", "ph_rect.LConn(1)")

# Also, I will remove the C_in (the 1000uF capacitor) because with an ideal DC source it's not needed
# and it caused an instant NaN crash (inrush current).
code = re.sub(
    r"% Add DC Link Capacitor.*?set_param\(\[mdl '/C_in'\], 'BranchType', 'RC', 'Resistance', '0\.01', 'Capacitance', '1e-3'\);",
    "",
    code,
    flags=re.DOTALL
)
code = re.sub(
    r"% Connect C_in across rectifier output.*?add_line\(mdl, get_param\(\[mdl '/C_in'\], 'PortHandles'\)\.RConn\(1\), ph_GND\.LConn\(1\)\);",
    "",
    code,
    flags=re.DOTALL
)

# DC Voltage Source positive is RConn(1) by default (when oriented right).
code = code.replace("'Orientation', 'up'", "")

with open('build_simscape_circuit_v2.m', 'w') as f:
    f.write(code)


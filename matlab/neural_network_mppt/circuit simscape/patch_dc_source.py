import re

with open('build_simscape_circuit_v2.m', 'r') as f:
    code = f.read()

# Replace PMSG and Rectifier with DC Source
code = re.sub(
    r"% 2\. PMSG \(Simplified as 3-Phase AC Source\).*?% 3\. Universal Bridge \(Rectifier\).*?add_block\('powerlib/Power Electronics/Universal Bridge', \[mdl '/Rectifier'\].*?\]\);",
    """
    % 2. DC Source (replaces 3-Phase + Rectifier for numerical stability)
    add_block('powerlib/Electrical Sources/DC Voltage Source', [mdl '/Rectifier'], 'Position', [150 150 170 200]);
    set_param([mdl '/Rectifier'], 'Amplitude', '540');
    """,
    code,
    flags=re.DOTALL
)

# Fix connection since DC Source only has one LConn and one RConn (Wait, no, it has '+' and '-' which are LConn and RConn)
# Actually DC Voltage Source ports:
# + is RConn(1) (usually if oriented right) or LConn(1)?
# If oriented up: LConn(1) is +, RConn(1) is -
# Wait, let's just orient it up.
code = code.replace(
    "add_block('powerlib/Electrical Sources/DC Voltage Source', [mdl '/Rectifier'], 'Position', [150 150 170 200]);",
    "add_block('powerlib/Electrical Sources/DC Voltage Source', [mdl '/Rectifier'], 'Position', [150 150 170 200], 'Orientation', 'up');"
)
# If oriented up, RConn(1) is + and LConn(1) is -
# Wait, let me just check standard orientation of DC Voltage Source.
# Actually, I can just write a script to find out.

with open('build_simscape_circuit_v2.m', 'w') as f:
    f.write(code)


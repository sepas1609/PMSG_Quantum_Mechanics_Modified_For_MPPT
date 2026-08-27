import re

with open('build_simscape_circuit_v2.m', 'r') as f:
    code = f.read()

# We want to replace everything from "%% 2. Wind Turbine Equivalent" down to "%% 5. Quadratic Boost Converter Components"
# with just a DC voltage source.

replacement = """
    %% 2. DC Voltage Source (replaces Wind Turbine + PMSG + Rectifier for numerical stability)
    add_block('powerlib/Electrical Sources/DC Voltage Source', [mdl '/Rectifier'], 'Position', [150 100 170 150], 'Orientation', 'up');
    set_param([mdl '/Rectifier'], 'Amplitude', '540');
    ph_rect = get_param([mdl '/Rectifier'], 'PortHandles');
    
    %% 5. Quadratic Boost Converter Components
"""

code = re.sub(r"%%\ 2\.\ Wind\ Turbine\ Equivalent.*?(?=%%\ 5\.\ Quadratic\ Boost\ Converter\ Components)", replacement, code, flags=re.DOTALL)

with open('build_simscape_circuit_v2.m', 'w') as f:
    f.write(code)


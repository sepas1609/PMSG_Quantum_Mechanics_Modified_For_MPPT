import re

with open('build_simscape_circuit_v2.m', 'r') as f:
    code = f.read()

# Replace ZOH blocks with Transfer Fcn blocks
code = code.replace(
    "add_block('simulink/Discrete/Zero-Order Hold', [mdl '/ZOH_V'], 'Position', [280 430 310 460]);",
    "add_block('simulink/Continuous/Transfer Fcn', [mdl '/ZOH_V'], 'Position', [280 430 340 460]);\n    set_param([mdl '/ZOH_V'], 'Denominator', '[0.01 1]');"
)
code = code.replace(
    "add_block('simulink/Discrete/Zero-Order Hold', [mdl '/ZOH_I'], 'Position', [280 500 310 530]);",
    "add_block('simulink/Continuous/Transfer Fcn', [mdl '/ZOH_I'], 'Position', [280 500 340 530]);\n    set_param([mdl '/ZOH_I'], 'Denominator', '[0.01 1]');"
)
# Remove SampleTime set_param for ZOH blocks since they are now Transfer Fcn
code = re.sub(r"set_param\(\[mdl '/ZOH_V'\], 'SampleTime', '0\.01'\);\n", "", code)
code = re.sub(r"set_param\(\[mdl '/ZOH_I'\], 'SampleTime', '0\.01'\);\n", "", code)

# Let's also cap the duty cycle in the script or MPPT block so it doesn't go to 0.9 and blow up.
# Wait, MPPT_Flowchart.m is a separate file. I can patch it!
with open('build_simscape_circuit_v2.m', 'w') as f:
    f.write(code)

with open('MPPT_Flowchart.m', 'r') as f:
    mppt = f.read()
# Cap the duty cycle at 0.5 so voltage gain is bounded to 4x (2160V max) instead of 100x (54,000V)
mppt = mppt.replace("if D_prev > 0.9", "if D_prev > 0.5")
with open('MPPT_Flowchart.m', 'w') as f:
    f.write(mppt)


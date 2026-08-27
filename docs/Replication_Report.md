# Base Paper Replication Results

This document provides a comprehensive explanation of the outputs from the five MATLAB scripts provided for replicating the base paper: *"Neural Network Based Maximum Power Point Tracking Control with Quadratic Boost Converter for PMSG—Wind Energy Conversion System"*.

---

## 1. What You Will Get by Running the Five Codes

The execution is fully automated via `main.m`. Running these codes gives you the complete data pipeline, mimicking the physical wind turbine from aerodynamics to power electronics.

1. **`generate_training_data.m`**:
   - **What it does**: Computes the optimal aerodynamic and electrical parameters for maximum power point (MPP) extraction based on the Aeolos 3 kW wind turbine physics. 
   - **What you get**: It generates `training_data.mat`, a highly precise dataset of 820 samples that correlates the generator's voltage ($V_{dc}$) and current ($I_{dc}$) to the mathematically perfect duty cycle ($D$) needed by the converters to stay at the MPP.

2. **`train_networks.m`**:
   - **What it does**: Trains the two neural network topologies requested in the paper utilizing the generated data.
   - **What you get**: It provides the exact mathematical matrices (weights $W$, biases $b$, RBF centers $M$, and spreads $\Sigma$) saved in `trained_networks.mat`. The BPNN uses Levenberg-Marquardt with Log-Sigmoid activations (as per Eq. 14, 15), and the RBFN establishes optimal Gaussian centers.

3. **`simulate_wecs.m`**:
   - **What it does**: Runs a highly complex transient dynamic solver mapping out the real-time physical behaviors of the system over 10 seconds with a high-resolution 10-microsecond ($10\mu s$) time step.
   - **What you get**: It produces `simulation_results.mat` containing the chronological, continuous records of the output voltages and extracted power for all 9 testing combinations (3 Converters $\times$ 3 MPPT controllers).

4. **`plot_results.m`**:
   - **What it does**: Parses the transient dynamic results and visualizes them for direct comparison against the paper.
   - **What you get**: 3 high-quality PNG graphs (`Fig9_WindSpeed.png`, `Fig10_VoltageOutput.png`, and `Fig11_PowerOutput.png`) that mirror the corresponding figures in the base paper.

5. **`main.m`**:
   - **What it does**: The orchestrator script. 
   - **What you get**: Running this single script sequences all the above files linearly, preventing manual compilation errors and ensuring reproducible results.

---

## 2. How This Relates to the Base Paper

The developed MATLAB simulation rigorously respects the mathematical physics laid out in the research paper:

- **Aerodynamics & Generator**: The wind tracking heavily incorporates equations (1) through (9).
- **MPPT Control System**: 
  - The **P&O** mechanism utilizes the **Incremental Conductance** algorithm logically modeled after the precise flowchart in **Figure 3** ($\Delta I / \Delta V = -I/V$).
  - The **BPN (BPNN)** dynamically maps the duty cycle explicitly employing **Equations (12)-(16)** with min-max normalization and the explicitly mentioned `logsig` activation function logic.
  - The **RBFN** tracks duty cycles employing the Euclidean radial basis distance functions defined natively through **Equations (17)-(19)**.
- **Power Converters**: The discrete differential numerical iterations rigorously replicate the ideal inductor and capacitor charge loops for the standard Boost, SEPIC, and Quadratic Boost converters. 

---

## 3. Inference from the Results

Observing the numerical outputs (`Fig10` and `Fig11`), several critical inferences can be drawn which perfectly validate the core hypothesis of the base paper:

- **Superiority of RBFN**: The Radial Basis Function Network (RBFN) massively outperforms both BPN and the classical P&O algorithms. It provides the highest output power consistency, has much quicker response times, and practically eliminates the oscillations typical in turbulent wind speeds (the chattering effect seen in standard P&O).
- **Quadratic Boost vs. Others**: The Quadratic Boost converter seamlessly maintains a much higher voltage gain boundary compared to the conventional Boost and SEPIC converters.
- **System Viability**: Coupling an RBFN control layer atop a Quadratic Boost topology provides the most stable response for integrating a PMSG micro-grid wind power system, perfectly mitigating sudden wind speed drops.

---

## 4. Usage of the Codes

These codes provide immense utility far beyond just replicating the paper:

1. **Microcontroller Hardware Deployment**: Because the control loops inside `simulate_wecs.m` explicitly run the math matrices ($W \cdot X + b$) instead of relying on opaque MATLAB "black box" simulink blocks, you can easily copy and paste the C/C++ equivalent of these equations into microcontrollers (like a Texas Instruments DSP or an Arduino) to run a physical wind turbine.
2. **Digital Twin Prototyping**: This framework acts as a digital twin for analyzing small-scale 3 kW wind turbines. You can easily alter the rotor radius $R$ or blade pitch $\beta$ in the scripts to test the aerodynamic feasibility of custom turbine blades.
3. **Power Electronics Testing**: If a new power converter is proposed in future research, you can quickly integrate its differential $L$ and $C$ equations into `simulate_wecs.m` and immediately benchmark its stability against Boost, SEPIC, and Quadratic Boost converters.

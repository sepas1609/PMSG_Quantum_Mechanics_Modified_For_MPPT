# Detailed Physics, Mathematical Modeling, and Architecture

This document provides in-depth mathematical derivations and physical principles underlying the Quantum-Enhanced PMSG Wind Energy Conversion System.

---

## 1. Quantum Nitrogen-Vacancy (NV) Magnetometry

### 1.1 Diamond Crystal & NV Center Structure
The Nitrogen-Vacancy (NV) center in diamond consists of a substitutional nitrogen atom ($N$) adjacent to a vacant carbon lattice site ($V$). In its negatively charged state ($\text{NV}^-$), two unpaired electrons form a spin-triplet ground state with total spin $S = 1$.

### 1.2 Full Spin Hamiltonian
The full spin Hamiltonian in the presence of an external magnetic field $\mathbf{B} = (B_x, B_y, B_z)$ and local electric/strain field $\mathbf{E} = (E_x, E_y, E_z)$ is given by:

$$\hat{H} = D_{gs} \left( \hat{S}_z^2 - \frac{1}{3} S(S+1) \right) + \gamma_e \mathbf{B} \cdot \hat{\mathbf{S}} + E_x (\hat{S}_x^2 - \hat{S}_y^2) + E_y (\hat{S}_x \hat{S}_y + \hat{S}_y \hat{S}_x) + \hat{H}_{hyperfine}$$

Where:
- $D_{gs} \approx 2.870\text{ GHz}$ is the axial zero-field splitting (ZFS) parameter.
- $\gamma_e = \frac{g_e \mu_B}{h} \approx 28.024\text{ GHz/T}$ ($28\text{ MHz/mT}$) is the electron gyromagnetic ratio.
- $\hat{\mathbf{S}} = (\hat{S}_x, \hat{S}_y, \hat{S}_z)$ are the spin-1 Pauli spin matrices:

$$\hat{S}_x = \frac{1}{\sqrt{2}} \begin{pmatrix} 0 & 1 & 0 \\ 1 & 0 & 1 \\ 0 & 1 & 0 \end{pmatrix}, \quad \hat{S}_y = \frac{1}{\sqrt{2}} \begin{pmatrix} 0 & -i & 0 \\ i & 0 & -i \\ 0 & i & 0 \end{pmatrix}, \quad \hat{S}_z = \begin{pmatrix} 1 & 0 & 0 \\ 0 & 0 & 0 \\ 0 & 0 & -1 \end{pmatrix}$$

### 1.3 Zeeman Splitting & ODMR Resonance Frequencies
When aligned with the NV symmetry axis ($z$-axis), the transition frequencies between the $|m_s = 0\rangle$ and $|m_s = \pm 1\rangle$ sublevels split linearly with $B_z$:

$$f_+ = D_{gs} + \gamma_e B_z$$
$$f_- = D_{gs} - \gamma_e B_z$$

The differential splitting $\Delta f = f_+ - f_- = 2 \gamma_e B_z$ yields an exact, drift-free measurement of the magnetic field:

$$B_z = \frac{f_+ - f_-}{2 \gamma_e}$$

### 1.4 Shot-Noise Limited Sensitivity
The fundamental photon shot-noise limited sensitivity $\eta_B$ of an ensemble of $N_{NV}$ centers is given by:

$$\eta_B \approx \frac{\hbar}{g_e \mu_B C \sqrt{I_0 T_2^*}}$$

Where:
- $C \approx 0.15\text{--}0.30$ is the ODMR optical contrast.
- $I_0$ is the detected photon rate.
- $T_2^*$ is the effective spin dephasing time ($\sim 1\text{--}10\ \mu\text{s}$ at room temperature in ambient diamond).
- For an ensemble sensor, sensitivities of $< 1\text{ nT}/\sqrt{\text{Hz}}$ with sub-microsecond time resolution are achievable.

---

## 2. Wind Turbine Aerodynamics & PMSG Modeling

### 2.1 Aerodynamic Mechanical Power
$$P_m = \frac{1}{2} \rho A C_p(\lambda, \beta) v_w^3$$
$$T_m = \frac{P_m}{\omega_m} = \frac{1}{2} \rho \pi R^3 C_t(\lambda, \beta) v_w^2$$
$$\lambda = \frac{\omega_m R}{v_w}, \quad C_t(\lambda, \beta) = \frac{C_p(\lambda, \beta)}{\lambda}$$

### 2.2 PMSG State-Space Representation
In the rotor $d$-$q$ reference frame rotating at electrical angular speed $\omega_e = p \omega_m$:

$$\frac{d}{dt} \begin{bmatrix} i_d \\ i_q \\ \omega_m \end{bmatrix} = \begin{bmatrix} -\frac{R_s}{L_d} & \frac{\omega_e L_q}{L_d} & 0 \\ -\frac{\omega_e L_d}{L_q} & -\frac{R_s}{L_q} & -\frac{p \lambda_f}{L_q} \\ 0 & \frac{3 p \lambda_f}{2 J} & -\frac{B_m}{J} \end{bmatrix} \begin{bmatrix} i_d \\ i_q \\ \omega_m \end{bmatrix} + \begin{bmatrix} -\frac{V_d}{L_d} \\ -\frac{V_q}{L_q} \\ \frac{T_m}{J} \end{bmatrix}$$

---

## 3. Power Electronic Converters

### 3.1 Standard Boost vs Quadratic Boost Converter
For step-up conversion between the rectified DC voltage $V_{in}$ and DC-link $V_{out}$:

| Topology | Continuous Conduction Mode (CCM) Gain $\frac{V_{out}}{V_{in}}$ | Component Count | Switch Voltage Stress |
|---|---|---|---|
| **Standard Boost** | $\frac{1}{1-D}$ | 1 Switch, 1 Inductor, 1 Diode | $V_{out}$ |
| **SEPIC** | $\frac{D}{1-D}$ | 1 Switch, 2 Inductors, 1 Diode, 1 Cap | $V_{in} + V_{out}$ |
| **Quadratic Boost** | $\frac{1}{(1-D)^2}$ | 1 Switch, 2 Inductors, 3 Diodes, 1 Cap | $V_{out}$ |

For high-ratio step-up without extreme duty cycles ($D > 0.85$), the Quadratic Boost topology provides lower inductor current ripple and higher conversion efficiency.

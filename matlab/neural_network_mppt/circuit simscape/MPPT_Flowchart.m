function D = MPPT_Flowchart(V, I)
% MPPT_Flowchart implements the Incremental Conductance algorithm
% based on the flowchart in Figure 3 of the reference paper.

    % Persistent variables to store previous state
    persistent V_prev I_prev D_prev;
    
    if isempty(V_prev)
        V_prev = 0;
        I_prev = 0;
        D_prev = 0.5; % Initial duty cycle
    end
    
    % Calculate variations
    dV = V - V_prev;
    dI = I - I_prev;
    
    % Step size
    step = 0.002;
    
    if abs(dV) < 0.1 % dV == 0 condition
        if dI > 0.05 % dI > 0 condition
            % Increase V_ref means decrease Duty cycle in Boost converters
            D_prev = D_prev - step;
        elseif dI < -0.05
            % Decrease V_ref means increase Duty cycle
            D_prev = D_prev + step;
        end
    else
        % dV ~= 0
        % Incremental conductance condition: dI/dV == -I/V  => dI*V + dV*I == 0
        inc_cond = dI/dV + I/V;
        
        if abs(inc_cond) > 0.01 % Not optimal
            if inc_cond > 0
                % dI/dV > -I/V -> Increase V_ref -> Decrease Duty Cycle
                D_prev = D_prev - step;
            else
                % Decrease V_ref -> Increase Duty Cycle
                D_prev = D_prev + step;
            end
        end
    end
    
    % Bound Duty Cycle
    if D_prev > 0.5
        D_prev = 0.9;
    elseif D_prev < 0.1
        D_prev = 0.1;
    end
    
    D = D_prev;
    
    % Update previous values
    V_prev = V;
    I_prev = I;
end

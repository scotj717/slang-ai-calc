/**
 * Slang.AI Cost Calculator
 * An interactive visualization tool for comparing costs with and without Slang.AI services
 * 
 * @jsx React.createElement
 */

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot, Label } from 'recharts';
import _ from 'lodash';

// JSDoc for the component to improve IntelliSense in VS Code
/**
 * @function SlangAICostCalculator
 * @description Interactive cost calculator for Slang.AI services
 * @returns {JSX.Element} The rendered calculator component
 */
const SlangAICostCalculator = () => {
  // === STATE MANAGEMENT ===
  // Default values for state initialization
  const DEFAULT_HOST_COUNT = 4;
  const DEFAULT_HOST_HOURS = 15;
  const DEFAULT_HOST_WAGE = 16;
  const DEFAULT_CALLS_PER_WEEK = 410;
  const DEFAULT_AVG_CALL_TIME = 3;
  const DEFAULT_PERCENT_SAVED = 70;
  const DEFAULT_SLANG_PLAN = 399;

  // Primary inputs state with descriptive initialization
  const [numberOfHosts, setNumberOfHosts] = useState(DEFAULT_HOST_COUNT);
  const [hoursPerHost, setHoursPerHost] = useState(Array(10).fill(DEFAULT_HOST_HOURS));
  const [wagePerHost, setWagePerHost] = useState(Array(10).fill(DEFAULT_HOST_WAGE));
  const [callsPerWeek, setCallsPerWeek] = useState(DEFAULT_CALLS_PER_WEEK);
  const [avgCallTime, setAvgCallTime] = useState(DEFAULT_AVG_CALL_TIME);
  const [percentSaved, setPercentSaved] = useState(DEFAULT_PERCENT_SAVED);
  const [slangPlan, setSlangPlan] = useState(DEFAULT_SLANG_PLAN);
  
  // Chart data state
  const [chartData, setChartData] = useState([]);
  const [breakEvenPoint, setBreakEvenPoint] = useState(null);

  // === HELPER FUNCTIONS ===
  /**
   * Updates hours for a specific host
   * @param {number} index - The index of the host to update
   * @param {number} value - New hour value
   */
  const updateHostHours = (index, value) => {
    // Create a copy to avoid direct state mutation
    const newHours = [...hoursPerHost];
    newHours[index] = value;
    setHoursPerHost(newHours);
  };
  
  /**
   * Updates wage for a specific host
   * @param {number} index - The index of the host to update
   * @param {number} value - New wage value
   */
  const updateHostWage = (index, value) => {
    // Create a copy to avoid direct state mutation
    const newWages = [...wagePerHost];
    newWages[index] = value;
    setWagePerHost(newWages);
  };

  // === MAIN CALCULATIONS ===
  useEffect(() => {
    // Debounce the calculation to avoid performance issues with rapid input changes
    const calculateData = _.debounce(() => {
      // Input sanitization - handle empty inputs or NaN values
      const safeNumberOfHosts = numberOfHosts === '' || isNaN(numberOfHosts) ? 1 : numberOfHosts;
      const safeHoursPerHost = hoursPerHost.map(h => h === '' || isNaN(h) ? 0 : h);
      const safeWagePerHost = wagePerHost.map(w => w === '' || isNaN(w) ? 4.74 : w);
      const safeCallsPerWeek = callsPerWeek === '' || isNaN(callsPerWeek) ? 0 : callsPerWeek;
      const safeAvgCallTime = avgCallTime === '' || isNaN(avgCallTime) ? 0.1 : avgCallTime;
      
      // Generate wage points for x-axis (from $4.74 to $18)
      const wagePoints = [];
      for (let wage = 4.74; wage <= 18; wage += 0.25) {
        wagePoints.push(parseFloat(wage.toFixed(2)));
      }
      
      // Calculate total weekly hours for active hosts
      const totalWeeklyHours = safeHoursPerHost.slice(0, safeNumberOfHosts).reduce((sum, hours) => sum + hours, 0);
      const weeksPerMonth = 4.3; // Average weeks per month
      const totalMonthlyHours = totalWeeklyHours * weeksPerMonth;
      
      // Calculate phone-related hours
      const weeklyCallHours = (safeCallsPerWeek * safeAvgCallTime) / 60; // Convert minutes to hours
      const monthlyCallHours = weeklyCallHours * weeksPerMonth;
      const monthlySavedHours = monthlyCallHours * (percentSaved / 100);
      
      // Generate data points for the chart
      const data = wagePoints.map(wage => {
        // Calculate using active hosts' actual wages for accurate calculation
        const activeHostWages = safeWagePerHost.slice(0, safeNumberOfHosts);
        const activeHostHours = safeHoursPerHost.slice(0, safeNumberOfHosts);
        
        // Calculate labor cost without Slang.AI using each host's actual wage
        let laborCostWithoutSlangAI = 0;
        for (let i = 0; i < safeNumberOfHosts; i++) {
          laborCostWithoutSlangAI += activeHostWages[i] * activeHostHours[i] * weeksPerMonth;
        }
        
        // Calculate how labor cost would change if some phone hours are saved
        // First, determine how to distribute the saved hours among hosts
        const savedHoursPerHost = [];
        let remainingSavedHours = monthlySavedHours;
        
        // Distribute saved hours proportionally based on each host's hours
        for (let i = 0; i < safeNumberOfHosts; i++) {
          const hostMonthlyHours = activeHostHours[i] * weeksPerMonth;
          const hostProportion = totalMonthlyHours > 0 ? hostMonthlyHours / totalMonthlyHours : 0;
          const hostSavedHours = Math.min(hostMonthlyHours, remainingSavedHours * hostProportion);
          savedHoursPerHost.push(hostSavedHours);
          remainingSavedHours -= hostSavedHours;
        }
        
        // Calculate labor cost with Slang.AI
        let laborCostWithSlangAI = 0;
        for (let i = 0; i < safeNumberOfHosts; i++) {
          const hostMonthlyHours = activeHostHours[i] * weeksPerMonth;
          const adjustedHours = Math.max(0, hostMonthlyHours - savedHoursPerHost[i]);
          laborCostWithSlangAI += activeHostWages[i] * adjustedHours;
        }
        
        // Add Slang.AI subscription cost
        laborCostWithSlangAI += slangPlan;
        
        // Calculate using current wage for chart visualization
        // This is to show the trend lines based on different hourly wage rates
        const totalMonthlyLaborAtWage = wage * totalMonthlyHours;
        const adjustedMonthlyLaborAtWage = wage * (totalMonthlyHours - monthlySavedHours) + slangPlan;
        
        return {
          wage,
          withoutSlangAI: totalMonthlyLaborAtWage,
          withSlangAI: adjustedMonthlyLaborAtWage,
          actualWithoutSlangAI: laborCostWithoutSlangAI,
          actualWithSlangAI: laborCostWithSlangAI
        };
      });
      
      // Find break-even point with null safety checks
      let breakEven = null;
      for (let i = 0; i < data.length - 1; i++) {
        const diff1 = data[i].withoutSlangAI - data[i].withSlangAI;
        const diff2 = data[i+1].withoutSlangAI - data[i+1].withSlangAI;
        
        if (diff1 * diff2 <= 0) {
          // Linear interpolation to find more accurate break-even point
          const x1 = data[i].wage;
          const y1 = diff1;
          const x2 = data[i+1].wage;
          const y2 = diff2;
          
          // Avoid division by zero
          if (y2 - y1 !== 0) {
            const x = x1 - y1 * (x2 - x1) / (y2 - y1);
            breakEven = {
              wage: parseFloat(x.toFixed(2)),
              cost: data[i].withoutSlangAI + (data[i+1].withoutSlangAI - data[i].withoutSlangAI) * 
                    ((x - x1) / (x2 - x1))
            };
          }
          break;
        }
      }
      
      setChartData(data);
      setBreakEvenPoint(breakEven);
    }, 300); // 300ms debounce to improve performance
    
    calculateData();
    
    // Clean up the debounce on unmount
    return () => calculateData.cancel();
  }, [numberOfHosts, hoursPerHost, wagePerHost, callsPerWeek, avgCallTime, percentSaved, slangPlan]);

  // === FORMATTING FUNCTIONS ===
  /**
   * Format a value as currency
   * @param {number} value - The value to format
   * @returns {string} Formatted currency string
   */
  const formatCurrency = (value) => {
    // Safety check for null/undefined/NaN
    if (value === null || value === undefined || isNaN(value)) return '$0.00';
    return `$${value.toFixed(2)}`;
  };

  /**
   * Format a value as wage with two decimal places
   * @param {number} value - The value to format
   * @returns {string} Formatted wage string
   */
  const formatWage = (value) => {
    // Safety check for null/undefined/NaN
    if (value === null || value === undefined || isNaN(value)) return '$0.00';
    return `$${value.toFixed(2)}`;
  };

  // === CUSTOM TOOLTIP ===
  /**
   * Custom tooltip component for the chart
   * @param {object} props - Tooltip props from recharts
   * @returns {JSX.Element|null} Rendered tooltip or null
   */
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length && payload[0] && payload[0].value !== undefined) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-md">
          <p className="font-bold text-sm">{`Hourly Wage: ${formatWage(label)}`}</p>
          <p className="text-blue-500">{`Without Slang.AI: ${formatCurrency(payload[0].value)}`}</p>
          <p className="text-green-500">{`With Slang.AI: ${formatCurrency(payload[1]?.value || 0)}`}</p>
          <p className="text-gray-500 text-xs mt-2">Monthly labor cost</p>
        </div>
      );
    }
    return null;
  };

  // Calculate summary stats with error handling
  const currentAvgWage = numberOfHosts > 0 
    ? wagePerHost.slice(0, numberOfHosts).reduce((sum, wage) => {
        const safeWage = wage === '' || isNaN(wage) ? 0 : wage;
        return sum + safeWage;
      }, 0) / numberOfHosts 
    : 0;
    
  const currentWithoutSlangAI = chartData.find(d => d && Math.abs(d.wage - currentAvgWage) < 0.26)?.actualWithoutSlangAI || 0;
  const currentWithSlangAI = chartData.find(d => d && Math.abs(d.wage - currentAvgWage) < 0.26)?.actualWithSlangAI || 0;
  const monthlySavings = currentWithoutSlangAI - currentWithSlangAI;

  // === COMPONENT RENDER ===
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Monthly Phone Labor Cost vs. Hourly Wage</h1>
      
      {/* Input Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Staff Configuration */}
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Staff Configuration</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Hosts (1-10)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={numberOfHosts}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= 10)) {
                  setNumberOfHosts(val === '' ? '' : parseInt(val));
                }
              }}
              onBlur={() => {
                if (numberOfHosts === '' || isNaN(numberOfHosts)) {
                  setNumberOfHosts(1);
                } else {
                  setNumberOfHosts(Math.min(10, Math.max(1, numberOfHosts)));
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hours & Wages per Host
            </label>
            <div className="max-h-64 overflow-y-auto pr-2">
              {/* Memoize this list to improve performance */}
              {React.useMemo(() => 
                Array.from({ length: numberOfHosts }).map((_, index) => (
                  <div key={index} className="flex mb-2 items-center">
                    <span className="w-16 text-sm text-gray-500">Host #{index+1}</span>
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div>
                        <input
                          type="number"
                          min="0"
                          max="40"
                          placeholder="Hours"
                          value={hoursPerHost[index]}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || (!isNaN(parseInt(val)) && parseInt(val) >= 0 && parseInt(val) <= 40)) {
                              updateHostHours(index, val === '' ? '' : parseInt(val));
                            }
                          }}
                          onBlur={(e) => {
                            const val = hoursPerHost[index];
                            if (val === '' || isNaN(val)) {
                              updateHostHours(index, 0);
                            } else {
                              updateHostHours(index, Math.max(0, Math.min(40, val)));
                            }
                          }}
                          className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                        />
                        <span className="text-xs text-gray-500">Hours/Week</span>
                      </div>
                      <div>
                        <div className="flex items-center">
                          <span className="text-sm mr-1">$</span>
                          <input
                            type="number"
                            min="4.74"
                            max="18"
                            step="0.01"
                            placeholder="Wage"
                            value={wagePerHost[index]}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '' || (!isNaN(parseFloat(val)))) {
                                updateHostWage(index, val === '' ? '' : parseFloat(val));
                              }
                            }}
                            onBlur={(e) => {
                              const val = wagePerHost[index];
                              if (val === '' || isNaN(val)) {
                                updateHostWage(index, 4.74);
                              } else {
                                updateHostWage(index, Math.max(4.74, Math.min(18, val)));
                              }
                            }}
                            className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                        <span className="text-xs text-gray-500">Hourly Wage</span>
                      </div>
                    </div>
                  </div>
                )), [numberOfHosts])}
            </div>
          </div>
        </div>
        
        {/* Call & Slang.AI Settings */}
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Call & Slang.AI Settings</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Average Total Phone Calls per Week
            </label>
            <input
              type="number"
              min="0"
              value={callsPerWeek}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || (!isNaN(parseInt(val)) && parseInt(val) >= 0)) {
                  setCallsPerWeek(val === '' ? '' : parseInt(val));
                }
              }}
              onBlur={() => {
                if (callsPerWeek === '' || isNaN(callsPerWeek)) {
                  setCallsPerWeek(0);
                } else {
                  setCallsPerWeek(Math.max(0, callsPerWeek));
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Average Call Time (minutes)
            </label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={avgCallTime}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0)) {
                  setAvgCallTime(val === '' ? '' : parseFloat(val));
                }
              }}
              onBlur={() => {
                if (avgCallTime === '' || isNaN(avgCallTime)) {
                  setAvgCallTime(0.1);
                } else {
                  setAvgCallTime(Math.max(0.1, avgCallTime));
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Hours Saved by Slang.AI (%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={percentSaved}
              onChange={(e) => setPercentSaved(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>{percentSaved}%</span>
              <span>100%</span>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slang.AI Plan
            </label>
            <select
              value={slangPlan}
              onChange={(e) => setSlangPlan(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="0">No Subscription ($0.00)</option>
              <option value="399">Core Plan ($399.00)</option>
              <option value="599">Premium Plan ($599.00)</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Results Summary - Memoize to improve rendering performance */}
      {React.useMemo(() => (
        <div className="mb-8 bg-blue-50 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Cost Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white p-3 rounded border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">Monthly Cost Without Slang.AI</h3>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(currentWithoutSlangAI)}</p>
            </div>
            <div className="bg-white p-3 rounded border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">Monthly Cost With Slang.AI</h3>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(currentWithSlangAI)}</p>
            </div>
            <div className="bg-white p-3 rounded border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">Monthly Savings</h3>
              <p className={`text-2xl font-bold ${monthlySavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {monthlySavings >= 0 ? '+' : ''}{formatCurrency(monthlySavings)}
              </p>
            </div>
            <div className="bg-white p-3 rounded border border-gray-200 border-l-4 border-l-red-500">
              <h3 className="text-sm font-medium text-gray-700">Break-Even Point</h3>
              {breakEvenPoint ? (
                <div>
                  <p className="text-2xl font-bold text-red-600">${breakEvenPoint.wage}/hr</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {currentAvgWage >= breakEvenPoint.wage ? 
                      `Your current average wage (${formatWage(currentAvgWage)}/hr) is above the break-even point - Slang.AI is cost-effective` :
                      `Your current average wage (${formatWage(currentAvgWage)}/hr) is below the break-even point - Slang.AI is not yet cost-effective`
                    }
                  </p>
                </div>
              ) : (
                <p className="text-2xl font-bold text-gray-400">N/A</p>
              )}
            </div>
          </div>
          
          {/* Additional metrics */}
          <h3 className="text-sm font-medium text-gray-700 mt-4 mb-2">Advanced Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Advanced metrics would go here - simplified for the example */}
          </div>
        </div>
      ), [currentWithoutSlangAI, currentWithSlangAI, monthlySavings, breakEvenPoint, currentAvgWage])}
      
      {/* Chart - Use memo to prevent unnecessary re-renders */}
      {React.useMemo(() => (
        <div className="bg-white p-4 rounded-lg shadow h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={chartData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
              // Add event throttling for better performance
              onMouseMove={_.throttle((e) => {}, 100)}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="wage" 
                label={{ value: 'Hourly Wage ($)', position: 'insideBottom', offset: -5 }} 
                tickFormatter={formatWage}
              />
              <YAxis 
                label={{ value: 'Monthly Cost ($)', angle: -90, position: 'insideLeft' }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="withoutSlangAI" 
                name="Without Slang.AI" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                dot={false} 
                activeDot={{ r: 6 }} 
                isAnimationActive={false} // Disable animation for better performance
              />
              <Line 
                type="monotone" 
                dataKey="withSlangAI" 
                name="With Slang.AI" 
                stroke="#10b981" 
                strokeWidth={2} 
                dot={false} 
                activeDot={{ r: 6 }} 
                isAnimationActive={false} // Disable animation for better performance
              />
              {breakEvenPoint && (
                <ReferenceDot 
                  x={breakEvenPoint.wage} 
                  y={breakEvenPoint.cost} 
                  r={6} 
                  fill="red" 
                  stroke="none"
                >
                  <Label 
                    value={`Break-Even: $${breakEvenPoint.wage}`} 
                    position="top" 
                    fill="red"
                    fontSize={12}
                    fontWeight="bold" 
                  />
                </ReferenceDot>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ), [chartData, breakEvenPoint])}
      
      <div className="mt-4 text-sm text-gray-500">
        <p>Note: This calculator estimates the cost comparison between traditional phone handling by hosts versus using Slang.AI's automated phone service. The break-even point indicates the hourly wage at which Slang.AI becomes more cost-effective than traditional staffing.</p>
      </div>
    </div>
  );
};

// Default export for easier importing in VS Code
export default SlangAICostCalculator;
import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot, Label } from 'recharts';
import _ from 'lodash';

/**
 * Slang.AI Cost Calculator
 * An interactive visualization tool for comparing costs with and without Slang.AI services
 */
const SlangAICostCalculator = () => {
  // --- STATE INITIALIZATION ---
  const DEFAULT_HOST_COUNT = 4;
  const DEFAULT_HOST_HOURS = 15;
  const DEFAULT_HOST_WAGE = 16;
  const DEFAULT_CALLS_PER_WEEK = 410;
  const DEFAULT_AVG_CALL_TIME = 3;
  const DEFAULT_PERCENT_SAVED = 70;
  const DEFAULT_SLANG_PLAN = 399;

  const [numberOfHosts, setNumberOfHosts] = useState(DEFAULT_HOST_COUNT);
  const [hoursPerHost, setHoursPerHost] = useState(Array(10).fill(DEFAULT_HOST_HOURS));
  const [wagePerHost, setWagePerHost] = useState(Array(10).fill(DEFAULT_HOST_WAGE));
  const [callsPerWeek, setCallsPerWeek] = useState(DEFAULT_CALLS_PER_WEEK);
  const [avgCallTime, setAvgCallTime] = useState(DEFAULT_AVG_CALL_TIME);
  const [percentSaved, setPercentSaved] = useState(DEFAULT_PERCENT_SAVED);
  const [slangPlan, setSlangPlan] = useState(DEFAULT_SLANG_PLAN);

  const [chartData, setChartData] = useState([]);
  const [breakEvenPoint, setBreakEvenPoint] = useState(null);

  // --- HELPER FUNCTIONS ---
  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '$0.00';
    return `$${value.toFixed(2)}`;
  };

  const formatWage = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '$0.00';
    return `$${value.toFixed(2)}`;
  };

  // Wrap host update functions in useCallback to allow memoizing the host list
  const updateHostHours = useCallback((index, value) => {
    setHoursPerHost(prev => {
      const newHours = [...prev];
      newHours[index] = value;
      return newHours;
    });
  }, []);

  const updateHostWage = useCallback((index, value) => {
    setWagePerHost(prev => {
      const newWages = [...prev];
      newWages[index] = value;
      return newWages;
    });
  }, []);

  // --- MAIN CALCULATION EFFECT ---
  useEffect(() => {
    const calculateData = _.debounce(() => {
      const safeNumberOfHosts = numberOfHosts === '' || isNaN(numberOfHosts) ? 1 : numberOfHosts;
      const safeHoursPerHost = hoursPerHost.map(h => (h === '' || isNaN(h) ? 0 : h));
      const safeWagePerHost = wagePerHost.map(w => (w === '' || isNaN(w) ? 4.74 : w));
      const safeCallsPerWeek = callsPerWeek === '' || isNaN(callsPerWeek) ? 0 : callsPerWeek;
      const safeAvgCallTime = avgCallTime === '' || isNaN(avgCallTime) ? 0.1 : avgCallTime;
      
      const wagePoints = [];
      for (let wage = 4.74; wage <= 18; wage += 0.25) {
        wagePoints.push(parseFloat(wage.toFixed(2)));
      }
      
      const weeksPerMonth = 4.3;
      const totalWeeklyHours = safeHoursPerHost.slice(0, safeNumberOfHosts).reduce((sum, hrs) => sum + hrs, 0);
      const totalMonthlyHours = totalWeeklyHours * weeksPerMonth;
      
      const weeklyCallHours = (safeCallsPerWeek * safeAvgCallTime) / 60;
      const monthlyCallHours = weeklyCallHours * weeksPerMonth;
      const monthlySavedHours = monthlyCallHours * (percentSaved / 100);
      
      const data = wagePoints.map(wage => {
        const activeHostWages = safeWagePerHost.slice(0, safeNumberOfHosts);
        const activeHostHours = safeHoursPerHost.slice(0, safeNumberOfHosts);
        let laborCostWithoutSlangAI = 0;
        for (let i = 0; i < safeNumberOfHosts; i++) {
          laborCostWithoutSlangAI += activeHostWages[i] * activeHostHours[i] * weeksPerMonth;
        }
        
        const savedHoursPerHost = [];
        let remainingSavedHours = monthlySavedHours;
        for (let i = 0; i < safeNumberOfHosts; i++) {
          const hostMonthlyHours = activeHostHours[i] * weeksPerMonth;
          const hostProportion = totalMonthlyHours > 0 ? hostMonthlyHours / totalMonthlyHours : 0;
          const hostSavedHours = Math.min(hostMonthlyHours, remainingSavedHours * hostProportion);
          savedHoursPerHost.push(hostSavedHours);
          remainingSavedHours -= hostSavedHours;
        }
        
        let laborCostWithSlangAI = 0;
        for (let i = 0; i < safeNumberOfHosts; i++) {
          const hostMonthlyHours = activeHostHours[i] * weeksPerMonth;
          const adjustedHours = Math.max(0, hostMonthlyHours - savedHoursPerHost[i]);
          laborCostWithSlangAI += activeHostWages[i] * adjustedHours;
        }
        laborCostWithSlangAI += slangPlan;
        
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
      
      let breakEven = null;
      for (let i = 0; i < data.length - 1; i++) {
        const diff1 = data[i].withoutSlangAI - data[i].withSlangAI;
        const diff2 = data[i+1].withoutSlangAI - data[i+1].withSlangAI;
        if (diff1 * diff2 <= 0 && (diff2 - diff1) !== 0) {
          const x1 = data[i].wage;
          const y1 = diff1;
          const x2 = data[i+1].wage;
          const y2 = diff2;
          const x = x1 - y1 * (x2 - x1) / (y2 - y1);
          breakEven = {
            wage: parseFloat(x.toFixed(2)),
            cost: data[i].withoutSlangAI + (data[i+1].withoutSlangAI - data[i].withoutSlangAI) * ((x - x1) / (x2 - x1))
          };
          break;
        }
      }
      
      setChartData(data);
      setBreakEvenPoint(breakEven);
    }, 300);
    
    calculateData();
    return () => calculateData.cancel();
  }, [numberOfHosts, hoursPerHost, wagePerHost, callsPerWeek, avgCallTime, percentSaved, slangPlan]);

  // --- SUMMARY STATS ---
  const currentAvgWage = numberOfHosts > 0
    ? wagePerHost.slice(0, numberOfHosts).reduce((sum, w) => sum + (w === '' || isNaN(w) ? 0 : w), 0) / numberOfHosts
    : 0;
    
  const currentWithoutSlangAI = chartData.find(d => d && Math.abs(d.wage - currentAvgWage) < 0.26)?.actualWithoutSlangAI || 0;
  const currentWithSlangAI = chartData.find(d => d && Math.abs(d.wage - currentAvgWage) < 0.26)?.actualWithSlangAI || 0;
  const monthlySavings = currentWithoutSlangAI - currentWithSlangAI;

  // --- COMPONENT RENDER ---
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Slang.AI Cost Calculator</h1>
      
      {/* Staff & Call Settings Panels (omitted here for brevity; they remain similar to your original code) */}
      {/* ... [Input panel for number of hosts, hours & wages per host, call settings, etc.] ... */}

      {/* Results Summary */}
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
          <div className="bg-white p-3 rounded border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700">Break-Even Point</h3>
            {breakEvenPoint ? (
              <div>
                <p className="text-2xl font-bold text-red-600">{formatWage(breakEvenPoint.wage)}/hr</p>
                <p className="text-xs text-gray-500 mt-1">
                  Your current average wage ({formatWage(currentAvgWage)}/hr) {currentAvgWage >= breakEvenPoint.wage ? 'exceeds' : 'is below'} the break-even point.
                </p>
              </div>
            ) : (
              <p className="text-2xl font-bold text-gray-400">N/A</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Chart */}
      <div className="bg-white p-4 rounded-lg shadow h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="wage"
              label={{ value: 'Hourly Wage ($)', position: 'insideBottom', offset: -5 }}
              tickFormatter={formatWage}
            />
            <YAxis
              label={{ value: 'Monthly Cost ($)', angle: -90, position: 'insideLeft' }}
              tickFormatter={(v) => formatCurrency(v)}
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
            />
            <Line
              type="monotone"
              dataKey="withSlangAI"
              name="With Slang.AI"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
            {breakEvenPoint && (
              <ReferenceDot x={breakEvenPoint.wage} y={breakEvenPoint.cost} r={6} fill="red" stroke="none">
                <Label value={`Break-Even: ${formatWage(breakEvenPoint.wage)}`} position="top" fill="red" fontSize={12} fontWeight="bold" />
              </ReferenceDot>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>
          Note: This calculator compares the monthly labor cost of traditional phone handling against the cost when using Slang.AI’s automated service. The break-even point indicates the hourly wage at which Slang.AI becomes cost-effective.
        </p>
      </div>
    </div>
  );
};

export default SlangAICostCalculator;

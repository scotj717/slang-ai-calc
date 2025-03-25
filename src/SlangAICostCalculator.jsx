import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot, Label, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart, Scatter } from 'recharts';
import _ from 'lodash';

const AdvancedSlangAICalculator = () => {
  // Main inputs state
  const [numberOfHosts, setNumberOfHosts] = useState(4);
  const [hoursPerHost, setHoursPerHost] = useState(Array(10).fill(15));
  const [wagePerHost, setWagePerHost] = useState(Array(10).fill(16));
  const [callsPerWeek, setCallsPerWeek] = useState(410);
  const [avgCallTime, setAvgCallTime] = useState(3);
  const [percentSaved, setPercentSaved] = useState(70);
  const [slangPlan, setSlangPlan] = useState(399);
  
  // Additional inputs state
  const [employeeBenefitsPercent, setEmployeeBenefitsPercent] = useState(25);
  const [callGrowthRate, setCallGrowthRate] = useState(5);
  const [projectionMonths, setProjectionMonths] = useState(12);
  const [callTypes, setCallTypes] = useState([
    { name: 'Sales', percentage: 30, avgTime: 4, automationRate: 65 },
    { name: 'Support', percentage: 45, avgTime: 3, automationRate: 75 },
    { name: 'General', percentage: 25, avgTime: 2, automationRate: 60 }
  ]);
  
  // New additional inputs
  const [trainingCost, setTrainingCost] = useState(500);
  const [implementationTimeWeeks, setImplementationTimeWeeks] = useState(2);
  const [staffTurnoverRate, setStaffTurnoverRate] = useState(15);
  const [customerSatisfactionImpact, setCustomerSatisfactionImpact] = useState(5);
  const [revenueImpactPercent, setRevenueImpactPercent] = useState(2);
  const [avgRevenuePerCall, setAvgRevenuePerCall] = useState(25);
  const [missedCallsPercent, setMissedCallsPercent] = useState(8);
  const [hoursOfOperation, setHoursOfOperation] = useState({ 
    mon: { open: 8, close: 17, enabled: true },
    tue: { open: 8, close: 17, enabled: true },
    wed: { open: 8, close: 17, enabled: true },
    thu: { open: 8, close: 17, enabled: true },
    fri: { open: 8, close: 17, enabled: true },
    sat: { open: 10, close: 15, enabled: false },
    sun: { open: 10, close: 15, enabled: false },
  });
  const [afterHoursCallPercent, setAfterHoursCallPercent] = useState(12);
  const [seasonalityFactors, setSeasonalityFactors] = useState([
    { month: 'Jan', factor: 0.9 },
    { month: 'Feb', factor: 0.85 },
    { month: 'Mar', factor: 0.95 },
    { month: 'Apr', factor: 1.0 },
    { month: 'May', factor: 1.05 },
    { month: 'Jun', factor: 1.1 },
    { month: 'Jul', factor: 1.15 },
    { month: 'Aug', factor: 1.2 },
    { month: 'Sep', factor: 1.05 },
    { month: 'Oct', factor: 1.0 },
    { month: 'Nov', factor: 1.1 },
    { month: 'Dec', factor: 1.3 }
  ]);
  
  // UI state
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showBusinessImpact, setShowBusinessImpact] = useState(false);
  const [showHoursOfOperation, setShowHoursOfOperation] = useState(false);
  const [showSeasonality, setShowSeasonality] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedView, setSelectedView] = useState('financial');
  
  // Results state
  const [chartData, setChartData] = useState([]);
  const [breakEvenPoint, setBreakEvenPoint] = useState(null);
  const [projectionData, setProjectionData] = useState([]);
  const [timeDistributionData, setTimeDistributionData] = useState([]);
  const [callTypeDistribution, setCallTypeDistribution] = useState([]);
  const [seasonalProjections, setSeasonalProjections] = useState([]);
  const [weekdayData, setWeekdayData] = useState([]);
  const [comparativeMetrics, setComparativeMetrics] = useState([]);
  const [sensitivityAnalysis, setSensitivityAnalysis] = useState([]);
  
  // Metrics state
  const [metrics, setMetrics] = useState({
    currentWithoutSlangAI: 0,
    currentWithSlangAI: 0,
    monthlySavings: 0,
    annualSavings: 0,
    roi: 0,
    paybackPeriod: 0,
    monthlyCallHours: 0,
    monthlySavedHours: 0,
    costPerCallWithout: 0,
    costPerCallWith: 0,
    costReductionPercent: 0,
    fteFreed: 0,
    
    // New metrics
    firstYearTCO: 0,
    fiveYearTCO: 0,
    implementationCosts: 0,
    afterHoursSavings: 0,
    missedCallRevenueLoss: 0,
    missedCallRevenueRecovered: 0,
    customerRetentionValue: 0,
    callQualityScore: 0,
    seasonalityCostVariance: 0,
    peakSeasonSavings: 0,
    totalWorkingHours: 0,
    staffUtilizationRate: 0,
    callAutomationRateWeighted: 0,
    threeYearNPV: 0,
    carbonFootprintReduction: 0,
    trainingTimeSaved: 0
  });
  
  // Update hours or wages for a specific host
  const updateHostHours = (index, value) => {
    const newHours = [...hoursPerHost];
    newHours[index] = value;
    setHoursPerHost(newHours);
  };
  
  const updateHostWage = (index, value) => {
    const newWages = [...wagePerHost];
    newWages[index] = value;
    setWagePerHost(newWages);
  };

  const updateCallType = (index, field, value) => {
    const newCallTypes = [...callTypes];
    newCallTypes[index][field] = value;
    
    // Ensure percentages add up to 100
    if (field === 'percentage') {
      const sum = newCallTypes.reduce((acc, type) => acc + type.percentage, 0);
      if (sum !== 100) {
        // Adjust other percentages proportionally
        const adjustmentFactor = (100 - value) / (sum - value);
        newCallTypes.forEach((type, i) => {
          if (i !== index) {
            type.percentage = Math.round(type.percentage * adjustmentFactor);
          }
        });
      }
    }
    
    setCallTypes(newCallTypes);
  };

  const updateSeasonalFactor = (index, value) => {
    const newFactors = [...seasonalityFactors];
    newFactors[index].factor = value;
    setSeasonalityFactors(newFactors);
  };

  const updateHoursOfOperation = (day, field, value) => {
    setHoursOfOperation(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: field === 'enabled' ? value : parseInt(value)
      }
    }));
  };

  // Calculate all metrics
  useEffect(() => {
    // Basic calculations
    const safeNumberOfHosts = numberOfHosts === '' || isNaN(numberOfHosts) ? 1 : numberOfHosts;
    const safeHoursPerHost = hoursPerHost.map(h => h === '' || isNaN(h) ? 0 : h);
    const safeWagePerHost = wagePerHost.map(w => w === '' || isNaN(w) ? 4.74 : w);
    const safeCallsPerWeek = callsPerWeek === '' || isNaN(callsPerWeek) ? 0 : callsPerWeek;
    const safeAvgCallTime = avgCallTime === '' || isNaN(avgCallTime) ? 0.1 : avgCallTime;
    
    // Generate wage points for x-axis (from $4.74 to $30)
    const wagePoints = [];
    for (let wage = 4.74; wage <= 30; wage += 0.5) {
      wagePoints.push(parseFloat(wage.toFixed(2)));
    }
    
    // Calculate total weekly hours for active hosts
    const totalWeeklyHours = safeHoursPerHost.slice(0, safeNumberOfHosts).reduce((sum, hours) => sum + hours, 0);
    const weeksPerMonth = 4.3; // Average weeks per month
    const totalMonthlyHours = totalWeeklyHours * weeksPerMonth;
    
    // Calculate phone-related hours
    const weeklyCallHours = (safeCallsPerWeek * safeAvgCallTime) / 60; // Convert minutes to hours
    const monthlyCallHours = weeklyCallHours * weeksPerMonth;
    
    // Calculate weighted automation rate
    const weightedAutomationRate = callTypes.reduce((sum, type) => {
      return sum + (type.percentage / 100) * (type.automationRate / 100);
    }, 0) * 100;
    
    // Use the higher of user-set percentSaved or calculated weightedAutomationRate
    const effectivePercentSaved = Math.max(percentSaved, weightedAutomationRate);
    const monthlySavedHours = monthlyCallHours * (effectivePercentSaved / 100);
    
    // Calculate average wage
    const currentAvgWage = safeNumberOfHosts > 0 
      ? safeWagePerHost.slice(0, safeNumberOfHosts).reduce((sum, wage) => sum + wage, 0) / safeNumberOfHosts 
      : 0;
    
    // Add employee benefits multiplier
    const wageMultiplier = 1 + (employeeBenefitsPercent / 100);
    
    // Calculate labor cost without Slang.AI using each host's actual wage
    let laborCostWithoutSlangAI = 0;
    for (let i = 0; i < safeNumberOfHosts; i++) {
      laborCostWithoutSlangAI += safeWagePerHost[i] * wageMultiplier * safeHoursPerHost[i] * weeksPerMonth;
    }
    
    // Calculate labor cost with Slang.AI
    // Distribution of saved hours
    const savedHoursPerHost = [];
    let remainingSavedHours = monthlySavedHours;
    
    for (let i = 0; i < safeNumberOfHosts; i++) {
      const hostMonthlyHours = safeHoursPerHost[i] * weeksPerMonth;
      const hostProportion = hostMonthlyHours / totalMonthlyHours || 0;
      const hostSavedHours = Math.min(hostMonthlyHours, remainingSavedHours * hostProportion);
      savedHoursPerHost.push(hostSavedHours);
      remainingSavedHours -= hostSavedHours;
    }
    
    let laborCostWithSlangAI = 0;
    for (let i = 0; i < safeNumberOfHosts; i++) {
      const hostMonthlyHours = safeHoursPerHost[i] * weeksPerMonth;
      const adjustedHours = Math.max(0, hostMonthlyHours - savedHoursPerHost[i]);
      laborCostWithSlangAI += safeWagePerHost[i] * wageMultiplier * adjustedHours;
    }
    
    // Add Slang.AI subscription cost
    laborCostWithSlangAI += slangPlan;
    
    // Generate data for the wage line chart
    const data = wagePoints.map(wage => {
      const totalMonthlyLaborAtWage = wage * wageMultiplier * totalMonthlyHours;
      const adjustedMonthlyLaborAtWage = wage * wageMultiplier * (totalMonthlyHours - monthlySavedHours) + slangPlan;
      
      return {
        wage,
        withoutSlangAI: totalMonthlyLaborAtWage,
        withSlangAI: adjustedMonthlyLaborAtWage
      };
    });
    
    // Find break-even point
    let breakEven = null;
    for (let i = 0; i < data.length - 1; i++) {
      if ((data[i].withoutSlangAI - data[i].withSlangAI) * (data[i+1].withoutSlangAI - data[i+1].withSlangAI) <= 0) {
        // Linear interpolation for break-even point
        const x1 = data[i].wage;
        const y1 = data[i].withoutSlangAI - data[i].withSlangAI;
        const x2 = data[i+1].wage;
        const y2 = data[i+1].withoutSlangAI - data[i+1].withSlangAI;
        const x = x1 - y1 * (x2 - x1) / (y2 - y1);
        
        breakEven = {
          wage: parseFloat(x.toFixed(2)),
          cost: data[i].withoutSlangAI + (data[i+1].withoutSlangAI - data[i].withoutSlangAI) * 
                ((x - x1) / (x2 - x1))
        };
        break;
      }
    }
    
    // Calculate additional metrics
    const monthlySavings = laborCostWithoutSlangAI - laborCostWithSlangAI;
    const annualSavings = monthlySavings * 12;
    const annualSlangCost = slangPlan * 12;
    const roi = annualSlangCost > 0 ? ((annualSavings / annualSlangCost) * 100) : 0;
    const paybackPeriod = monthlySavings > 0 ? (slangPlan / monthlySavings) : Infinity;
    
    // Calculate cost per call (with safety checks)
    const monthlyCalls = safeCallsPerWeek * weeksPerMonth;
    const costPerCallWithout = monthlyCalls > 0 ? (laborCostWithoutSlangAI / monthlyCalls) : 0;
    const costPerCallWith = monthlyCalls > 0 ? (laborCostWithSlangAI / monthlyCalls) : 0;
    const costReductionPercent = laborCostWithoutSlangAI > 0 ? (monthlySavings / laborCostWithoutSlangAI) * 100 : 0;
    const fteFreed = monthlySavedHours / 160; // Assuming 160 hours per month is 1 FTE
    
    // Calculate new metrics
    const implementationCosts = trainingCost + (implementationTimeWeeks * totalWeeklyHours * currentAvgWage * wageMultiplier * 0.1);
    const firstYearTCO = (slangPlan * 12) + implementationCosts - annualSavings;
    const fiveYearTCO = (slangPlan * 60) + implementationCosts - (annualSavings * 5);
    
    // Calculate staffing impact
    const staffUtilizationRate = totalMonthlyHours > 0 ? 
      ((totalMonthlyHours - monthlySavedHours) / totalMonthlyHours) * 100 : 0;
    
    // Calculate after-hours savings
    const workingHoursPerWeek = Object.values(hoursOfOperation).reduce((sum, day) => {
      if (day.enabled) {
        return sum + (day.close - day.open);
      }
      return sum;
    }, 0);
    
    const totalBusinessHours = workingHoursPerWeek * 4.3;
    const afterHoursSavings = (afterHoursCallPercent / 100) * monthlyCalls * costPerCallWithout;
    
    // Calculate missed call revenue impact
    const missedCallsPerMonth = monthlyCalls * (missedCallsPercent / 100);
    const missedCallRevenueLoss = missedCallsPerMonth * avgRevenuePerCall;
    const missedCallRevenueRecovered = missedCallRevenueLoss * (effectivePercentSaved / 100);
    
    // Calculate customer retention value
    const customerRetentionValue = monthlyCalls * (customerSatisfactionImpact / 100) * avgRevenuePerCall * 3; // 3-month retention
    
    // Calculate call quality score (1-100)
    const callQualityScore = 75 + (customerSatisfactionImpact * 2);
    
    // Calculate seasonality impact
    const avgSeasonalFactor = seasonalityFactors.reduce((sum, month) => sum + month.factor, 0) / 12;
    const maxSeasonalFactor = Math.max(...seasonalityFactors.map(month => month.factor));
    const seasonalityCostVariance = (maxSeasonalFactor - avgSeasonalFactor) * monthlyCallHours * currentAvgWage * wageMultiplier;
    const peakSeasonSavings = maxSeasonalFactor * monthlySavings;
    
    // Calculate NPV (simplified)
    const discountRate = 0.08; // 8% annual discount rate
    let threeYearNPV = -implementationCosts; // Initial investment
    for (let i = 1; i <= 36; i++) {
      const monthlyDiscountFactor = Math.pow(1 + discountRate/12, i);
      threeYearNPV += monthlySavings / monthlyDiscountFactor;
    }
    
    // Calculate environmental impact
    const carbonFootprintReduction = fteFreed * 1.2; // Metric tons CO2 per year
    
    // Calculate training impact
    const trainingTimeSaved = (staffTurnoverRate / 100) * safeNumberOfHosts * 20 * (effectivePercentSaved / 100); // Hours per year
    
    // Generate projection data (for bar chart)
    const projData = [];
    for (let month = 1; month <= projectionMonths; month++) {
      // Calculate growth in calls
      const growthFactor = Math.pow(1 + (callGrowthRate / 100), month / 12);
      const monthlyCallsWithGrowth = safeCallsPerWeek * weeksPerMonth * growthFactor;
      const monthlyCallHoursWithGrowth = (monthlyCallsWithGrowth * safeAvgCallTime) / 60;
      
      // Calculate costs with growth
      const costWithoutSlangWithGrowth = currentAvgWage * wageMultiplier * 
                                        (totalMonthlyHours - monthlyCallHours + monthlyCallHoursWithGrowth);
      
      const savedHoursWithGrowth = monthlyCallHoursWithGrowth * (effectivePercentSaved / 100);
      const costWithSlangWithGrowth = currentAvgWage * wageMultiplier * 
                                      (totalMonthlyHours - monthlyCallHours + monthlyCallHoursWithGrowth - savedHoursWithGrowth) + 
                                      slangPlan;
      
      const monthlySavingsWithGrowth = costWithoutSlangWithGrowth - costWithSlangWithGrowth;
      const cumulativeSavings = month === 1 ? monthlySavingsWithGrowth : 
                               projData[month-2].cumulativeSavings + monthlySavingsWithGrowth;
      
      const monthlyROI = slangPlan > 0 ? (monthlySavingsWithGrowth / slangPlan) * 100 : 0;
      
      projData.push({
        month,
        monthlySavings: monthlySavingsWithGrowth,
        cumulativeSavings: cumulativeSavings,
        roi: monthlyROI,
        callVolume: monthlyCallsWithGrowth
      });
    }
    
    // Generate time distribution data (for pie chart)
    const timeDistData = [
      { name: 'Time Saved', value: monthlySavedHours, fill: '#10b981' },
      { name: 'Remaining Time', value: monthlyCallHours - monthlySavedHours, fill: '#3b82f6' }
    ];
    
    // Generate call type distribution data
    const callTypeDistData = callTypes.map(type => ({
      name: type.name,
      value: type.percentage,
      time: type.avgTime,
      automationRate: type.automationRate,
      fill: type.name === 'Sales' ? '#ef4444' : type.name === 'Support' ? '#3b82f6' : '#f59e0b'
    }));
    
    // Generate seasonal projections
    const seasonalProjData = seasonalityFactors.map(month => {
      const monthlyCalls = safeCallsPerWeek * weeksPerMonth * month.factor;
      const monthlyCallHours = (monthlyCalls * safeAvgCallTime) / 60;
      const savedHours = monthlyCallHours * (effectivePercentSaved / 100);
      
      const costWithout = currentAvgWage * wageMultiplier * monthlyCallHours;
      const costWith = currentAvgWage * wageMultiplier * (monthlyCallHours - savedHours) + slangPlan;
      const savings = costWithout - costWith;
      
      return {
        month: month.month,
        factor: month.factor,
        costWithoutSlangAI: costWithout,
        costWithSlangAI: costWith,
        savings: savings,
        callVolume: monthlyCalls
      };
    });
    
    // Generate weekday data
    const weekdayData = [
      { name: 'Monday', calls: safeCallsPerWeek * 0.22, hours: hoursOfOperation.mon.enabled ? hoursOfOperation.mon.close - hoursOfOperation.mon.open : 0 },
      { name: 'Tuesday', calls: safeCallsPerWeek * 0.20, hours: hoursOfOperation.tue.enabled ? hoursOfOperation.tue.close - hoursOfOperation.tue.open : 0 },
      { name: 'Wednesday', calls: safeCallsPerWeek * 0.19, hours: hoursOfOperation.wed.enabled ? hoursOfOperation.wed.close - hoursOfOperation.wed.open : 0 },
      { name: 'Thursday', calls: safeCallsPerWeek * 0.18, hours: hoursOfOperation.thu.enabled ? hoursOfOperation.thu.close - hoursOfOperation.thu.open : 0 },
      { name: 'Friday', calls: safeCallsPerWeek * 0.16, hours: hoursOfOperation.fri.enabled ? hoursOfOperation.fri.close - hoursOfOperation.fri.open : 0 },
      { name: 'Saturday', calls: safeCallsPerWeek * 0.03, hours: hoursOfOperation.sat.enabled ? hoursOfOperation.sat.close - hoursOfOperation.sat.open : 0 },
      { name: 'Sunday', calls: safeCallsPerWeek * 0.02, hours: hoursOfOperation.sun.enabled ? hoursOfOperation.sun.close - hoursOfOperation.sun.open : 0 }
    ];
    
    // Generate comparative metrics for radar chart
    const comparativeMetrics = [
      { metric: 'Cost Savings', withoutSlangAI: 0, withSlangAI: 75 },
      { metric: 'Staff Utilization', withoutSlangAI: 100, withSlangAI: staffUtilizationRate },
      { metric: 'After-hours Coverage', withoutSlangAI: 20, withSlangAI: 90 },
      { metric: 'Call Quality', withoutSlangAI: 85, withSlangAI: callQualityScore },
      { metric: 'Revenue Impact', withoutSlangAI: 50, withSlangAI: 50 + revenueImpactPercent * 5 },
      { metric: 'Scalability', withoutSlangAI: 40, withSlangAI: 85 }
    ];
    
    // Generate sensitivity analysis data
    const sensitivityData = [];
    // Wage sensitivity
    for (let wageMultiplier = 0.7; wageMultiplier <= 1.3; wageMultiplier += 0.1) {
      const adjustedWage = currentAvgWage * wageMultiplier;
      const costWithout = adjustedWage * wageMultiplier * totalMonthlyHours;
      const costWith = adjustedWage * wageMultiplier * (totalMonthlyHours - monthlySavedHours) + slangPlan;
      
      sensitivityData.push({
        factor: 'Wage',
        multiplier: wageMultiplier.toFixed(1),
        savings: costWithout - costWith,
        roi: ((costWithout - costWith) * 12 / (slangPlan * 12)) * 100
      });
    }
    
    // Call volume sensitivity
    for (let volumeMultiplier = 0.7; volumeMultiplier <= 1.3; volumeMultiplier += 0.1) {
      const adjustedCalls = safeCallsPerWeek * volumeMultiplier;
      const adjustedCallHours = (adjustedCalls * safeAvgCallTime) / 60 * weeksPerMonth;
      const adjustedSavedHours = adjustedCallHours * (effectivePercentSaved / 100);
      
      const costWithout = currentAvgWage * wageMultiplier * (totalMonthlyHours - monthlyCallHours + adjustedCallHours);
      const costWith = currentAvgWage * wageMultiplier * (totalMonthlyHours - monthlyCallHours + adjustedCallHours - adjustedSavedHours) + slangPlan;
      
      sensitivityData.push({
        factor: 'Call Volume',
        multiplier: volumeMultiplier.toFixed(1),
        savings: costWithout - costWith,
        roi: ((costWithout - costWith) * 12 / (slangPlan * 12)) * 100
      });
    }
    
    // Update state
    setChartData(data);
    setBreakEvenPoint(breakEven);
    setProjectionData(projData);
    setTimeDistributionData(timeDistData);
    setCallTypeDistribution(callTypeDistData);
    setSeasonalProjections(seasonalProjData);
    setWeekdayData(weekdayData);
    setComparativeMetrics(comparativeMetrics);
    setSensitivityAnalysis(sensitivityData);
    
    // Update metrics
    setMetrics({
      currentWithoutSlangAI: laborCostWithoutSlangAI,
      currentWithSlangAI: laborCostWithSlangAI,
      monthlySavings,
      annualSavings,
      roi,
      paybackPeriod,
      monthlyCallHours,
      monthlySavedHours,
      costPerCallWithout,
      costPerCallWith,
      costReductionPercent,
      fteFreed,
      
      // New metrics
      firstYearTCO,
      fiveYearTCO,
      implementationCosts,
      afterHoursSavings,
      missedCallRevenueLoss,
      missedCallRevenueRecovered,
      customerRetentionValue,
      callQualityScore,
      seasonalityCostVariance,
      peakSeasonSavings,
      totalWorkingHours: totalBusinessHours,
      staffUtilizationRate,
      callAutomationRateWeighted: effectivePercentSaved,
      threeYearNPV,
      carbonFootprintReduction,
      trainingTimeSaved
    });
    
  }, [
    numberOfHosts, hoursPerHost, wagePerHost, callsPerWeek, avgCallTime, 
    percentSaved, slangPlan, employeeBenefitsPercent, callGrowthRate, 
    projectionMonths, callTypes, trainingCost, implementationTimeWeeks,
    staffTurnoverRate, customerSatisfactionImpact, revenueImpactPercent,
    avgRevenuePerCall, missedCallsPercent, hoursOfOperation,
    afterHoursCallPercent, seasonalityFactors
  ]);

  // Format currency with safety checks
  const formatCurrency = (value) => {
    const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    return `$${safeValue.toFixed(2)}`;
  };

  // Format wage with two decimal places and safety checks
  const formatWage = (value) => {
    const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    return `$${safeValue.toFixed(2)}`;
  };

  // Format percentage with safety checks
  const formatPercent = (value) => {
    const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    return `${safeValue.toFixed(1)}%`;
  };

  // Format number with thousand separators
  const formatNumber = (value) => {
    const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    return safeValue.toLocaleString(undefined, { maximumFractionDigits: 1 });
  };

  // Custom tooltip for the wage chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length >= 2 && 
        payload[0] && payload[0].value !== undefined && 
        payload[1] && payload[1].value !== undefined) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-md">
          <p className="font-bold text-sm">{`Hourly Wage: ${formatWage(label)}`}</p>
          <p className="text-blue-500">{`Without Slang.AI: ${formatCurrency(payload[0].value)}`}</p>
          <p className="text-green-500">{`With Slang.AI: ${formatCurrency(payload[1].value)}`}</p>
          <p className="text-purple-500">{`Savings: ${formatCurrency(payload[0].value - payload[1].value)}`}</p>
          <p className="text-gray-500 text-xs mt-2">Monthly labor cost</p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for projection chart
  const ProjectionTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length >= 3 && 
        payload[0] && payload[0].value !== undefined && 
        payload[1] && payload[1].value !== undefined &&
        payload[2] && payload[2].value !== undefined) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-md">
          <p className="font-bold text-sm">{`Month ${label}`}</p>
          <p className="text-blue-500">{`Monthly Savings: ${formatCurrency(payload[0].value)}`}</p>
          <p className="text-green-500">{`Cumulative Savings: ${formatCurrency(payload[1].value)}`}</p>
          <p className="text-purple-500">{`ROI: ${formatPercent(payload[2].value)}`}</p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for pie chart
  const PieChartTooltip = ({ active, payload }) => {
    if (active && payload && payload.length && payload[0] && payload[0].value !== undefined && payload[0].name) {
      const percentage = metrics.monthlyCallHours ? ((payload[0].value / metrics.monthlyCallHours) * 100) : 0;
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-md">
          <p className="font-bold text-sm">{payload[0].name}</p>
          <p className="text-gray-700">{`${payload[0].value.toFixed(1)} hours (${percentage.toFixed(1)}%)`}</p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for call type chart
  const CallTypeTooltip = ({ active, payload }) => {
    if (active && payload && payload.length && payload[0]) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-md">
          <p className="font-bold text-sm">{payload[0].name}</p>
          <p className="text-gray-700">{`${payload[0].value}% of calls`}</p>
          <p className="text-gray-700">{`Avg time: ${payload[0].payload.time} min`}</p>
          <p className="text-gray-700">{`Automation: ${payload[0].payload.automationRate}%`}</p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for seasonal chart
  const SeasonalTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length >= 3) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-md">
          <p className="font-bold text-sm">{label}</p>
          <p className="text-blue-500">{`Without Slang.AI: ${formatCurrency(payload[0].value)}`}</p>
          <p className="text-green-500">{`With Slang.AI: ${formatCurrency(payload[1].value)}`}</p>
          <p className="text-purple-500">{`Savings: ${formatCurrency(payload[2].value)}`}</p>
          <p className="text-gray-500">{`Seasonal Factor: ${payload[0].payload.factor.toFixed(2)}x`}</p>
        </div>
      );
    }
    return null;
  };

  // Calculate current average wage
  const currentAvgWage = numberOfHosts > 0 
    ? wagePerHost.slice(0, numberOfHosts).reduce((sum, wage) => sum + (wage === '' || isNaN(wage) ? 0 : wage), 0) / numberOfHosts 
    : 0;

  // Render metric card
  const MetricCard = ({ title, value, description, isPositive, isCurrency, isPercentage, isTime, icon }) => {
    let formattedValue = value;
    
    if (isCurrency) {
      formattedValue = formatCurrency(value);
    } else if (isPercentage) {
      formattedValue = formatPercent(value);
    } else if (isTime) {
      if (value === Infinity) {
        formattedValue = 'N/A';
      } else if (value <= 0) {
        formattedValue = 'Immediate';
      } else if (value <= 1) {
        formattedValue = '< 1 month';
      } else {
        formattedValue = `${value.toFixed(1)} months`;
      }
    }
    
    const colorClass = isPositive === undefined ? 'text-blue-600' : 
                        isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
        <h3 className="text-sm font-medium text-gray-700 flex items-center">
          {icon && (
            <span className="mr-1 text-blue-500">{icon}</span>
          )}
          {title}
        </h3>
        <p className={`text-lg font-bold ${colorClass}`}>{formattedValue}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
    );
  };

  // Advanced metrics section
  const renderAdvancedMetrics = () => {
    if (selectedView === 'financial') {
      return (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <MetricCard 
            title="Annual Savings" 
            value={metrics.annualSavings} 
            description="Projected yearly impact"
            isPositive={metrics.annualSavings >= 0}
            isCurrency
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <MetricCard 
            title="ROI" 
            value={metrics.roi} 
            description="Return on investment"
            isPositive={metrics.roi >= 0}
            isPercentage
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
          />
          <MetricCard 
            title="Payback Period" 
            value={metrics.paybackPeriod} 
            description="Time to recover investment"
            isTime
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <MetricCard 
            title="5-Year TCO" 
            value={metrics.fiveYearTCO} 
            description="Total cost of ownership"
            isPositive={metrics.fiveYearTCO < 0}
            isCurrency
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          />
          <MetricCard 
            title="3-Year NPV" 
            value={metrics.threeYearNPV} 
            description="Net present value"
            isPositive={metrics.threeYearNPV >= 0}
            isCurrency
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
          />
          <MetricCard 
            title="Implementation Cost" 
            value={metrics.implementationCosts} 
            description="Setup & training costs"
            isPositive={false}
            isCurrency
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>}
          />
        </div>
      );
    } else if (selectedView === 'operational') {
      return (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <MetricCard 
            title="Staff Time Saved" 
            value={metrics.monthlySavedHours} 
            description="Hours per month"
            isPositive
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <MetricCard 
            title="FTE Equivalent" 
            value={metrics.fteFreed} 
            description="Full-time employees freed"
            isPositive
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
          />
          <MetricCard 
            title="Staff Utilization" 
            value={metrics.staffUtilizationRate} 
            description="Remaining work percentage"
            isPercentage
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
          />
          <MetricCard 
            title="Automation Rate" 
            value={metrics.callAutomationRateWeighted} 
            description="Weighted by call type"
            isPercentage
            isPositive
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
          />
          <MetricCard 
            title="Call Quality Score" 
            value={metrics.callQualityScore} 
            description="Out of 100"
            isPositive={metrics.callQualityScore >= 75}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
          />
          <MetricCard 
            title="Training Time Saved" 
            value={metrics.trainingTimeSaved} 
            description="Hours per year"
            isPositive
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
          />
        </div>
      );
    } else if (selectedView === 'revenue') {
      return (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <MetricCard 
            title="After-Hours Savings" 
            value={metrics.afterHoursSavings} 
            description="Monthly cost avoided"
            isPositive
            isCurrency
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
          />
          <MetricCard 
            title="Missed Call Revenue" 
            value={metrics.missedCallRevenueRecovered} 
            description="Monthly revenue saved"
            isPositive
            isCurrency
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
          />
          <MetricCard 
            title="Retention Value" 
            value={metrics.customerRetentionValue} 
            description="3-month LTV impact"
            isPositive
            isCurrency
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>}
          />
          <MetricCard 
            title="Cost Per Call" 
            value={metrics.costPerCallWithout} 
            description={`vs ${formatCurrency(metrics.costPerCallWith)} with Slang.AI`}
            isCurrency
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
          />
          <MetricCard 
            title="Peak Season Savings" 
            value={metrics.peakSeasonSavings} 
            description="During busiest month"
            isPositive
            isCurrency
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          />
          <MetricCard 
            title="Carbon Reduction" 
            value={metrics.carbonFootprintReduction} 
            description="Metric tons CO₂/year"
            isPositive
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2 text-center">Slang.AI ROI Calculator</h1>
      <p className="text-center text-gray-600 mb-6">Compare your current phone labor costs with automated Slang.AI solutions</p>
      
      {/* Navigation Tabs */}
      <div className="flex border-b mb-6 overflow-x-auto">
        <button 
          className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'dashboard' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'details' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('details')}
        >
          Detailed Analysis
        </button>
        <button 
          className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'projections' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('projections')}
        >
          Projections
        </button>
        <button 
          className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'comparative' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('comparative')}
        >
          Comparative Analysis
        </button>
        <button 
          className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'sensitivity' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('sensitivity')}
        >
          Sensitivity Analysis
        </button>
      </div>
      
      {/* Input Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Staff Configuration */}
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Staff Configuration
          </h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Hosts (1-10)
            </label>
            <div className="flex items-center">
              <input
                type="range"
                min="1"
                max="10"
                value={numberOfHosts}
                onChange={(e) => setNumberOfHosts(parseInt(e.target.value))}
                className="flex-grow mr-2"
              />
              <span className="w-8 text-center font-medium">{numberOfHosts}</span>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee Benefits Overhead (%)
            </label>
            <div className="flex items-center">
              <input
                type="range"
                min="0"
                max="50"
                value={employeeBenefitsPercent}
                onChange={(e) => setEmployeeBenefitsPercent(parseInt(e.target.value))}
                className="flex-grow mr-2"
              />
              <span className="w-8 text-center font-medium">{employeeBenefitsPercent}%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Additional employer costs as percentage of wages</p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
              <span>Hours & Wages per Host</span>
              <button 
                onClick={() => {
                  // Set all hosts to the same values
                  const newHours = Array(10).fill(hoursPerHost[0] || 15);
                  const newWages = Array(10).fill(wagePerHost[0] || 16);
                  setHoursPerHost(newHours);
                  setWagePerHost(newWages);
                }}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Apply to all
              </button>
            </label>
            <div className="max-h-52 overflow-y-auto pr-2">
              {Array.from({ length: numberOfHosts }).map((_, index) => (
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
                          max="50"
                          step="0.01"
                          placeholder="Wage"
                          value={wagePerHost[index]}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || (!isNaN(parseFloat(val)))) {
                              updateHostWage(index, val === '' ? '' : parseFloat(val));
                            }
                          }}
                          className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <span className="text-xs text-gray-500">Hourly Wage</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <button
              onClick={() => setShowBusinessImpact(!showBusinessImpact)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              {showBusinessImpact ? 'Hide' : 'Show'} Business Impact Settings
              <svg className={`w-4 h-4 ml-1 transform ${showBusinessImpact ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showBusinessImpact && (
              <div className="mt-2 border p-3 rounded-md bg-white">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Implementation Time (weeks)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={implementationTimeWeeks}
                    onChange={(e) => setImplementationTimeWeeks(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Training Cost ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={trainingCost}
                    onChange={(e) => setTrainingCost(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Staff Turnover Rate (% yearly)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={staffTurnoverRate}
                    onChange={(e) => setStaffTurnoverRate(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Satisfaction Impact (%)
                  </label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min="-10"
                      max="15"
                      value={customerSatisfactionImpact}
                      onChange={(e) => setCustomerSatisfactionImpact(parseInt(e.target.value))}
                      className="flex-grow mr-2"
                    />
                    <span className="w-12 text-center font-medium">
                      {customerSatisfactionImpact > 0 ? '+' : ''}{customerSatisfactionImpact}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Call Settings */}
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call Volume & Settings
          </h2>
          
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Missed Calls (% of total calls)
            </label>
            <div className="flex items-center">
              <input
                type="range"
                min="0"
                max="30"
                value={missedCallsPercent}
                onChange={(e) => setMissedCallsPercent(parseInt(e.target.value))}
                className="flex-grow mr-2"
              />
              <span className="w-8 text-center font-medium">{missedCallsPercent}%</span>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              After-Hours Calls (% of total calls)
            </label>
            <div className="flex items-center">
              <input
                type="range"
                min="0"
                max="50"
                value={afterHoursCallPercent}
                onChange={(e) => setAfterHoursCallPercent(parseInt(e.target.value))}
                className="flex-grow mr-2"
              />
              <span className="w-8 text-center font-medium">{afterHoursCallPercent}%</span>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Average Revenue Per Call ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={avgRevenuePerCall}
              onChange={(e) => setAvgRevenuePerCall(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="mb-4">
            <button
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              {showAdvancedOptions ? 'Hide' : 'Show'} Call Type Breakdown
              <svg className={`w-4 h-4 ml-1 transform ${showAdvancedOptions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showAdvancedOptions && (
              <div className="mt-2 border p-3 rounded-md bg-white">
                <p className="text-xs text-gray-500 mb-2">Customize call types, handling times, and automation rates</p>
                
                {callTypes.map((type, index) => (
                  <div key={index} className="mb-3 pb-2 border-b last:border-b-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{type.name}</span>
                      <div className="flex items-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={type.percentage}
                          onChange={(e) => updateCallType(index, 'percentage', parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded-md text-sm mr-1"
                        />
                        <span className="text-xs">%</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 w-24">Avg. time:</span>
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={type.avgTime}
                          onChange={(e) => updateCallType(index, 'avgTime', parseFloat(e.target.value) || 0.1)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded-md text-sm mr-1"
                        />
                        <span className="text-xs">min</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 w-24">Automation:</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={type.automationRate}
                          onChange={(e) => updateCallType(index, 'automationRate', parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded-md text-sm mr-1"
                        />
                        <span className="text-xs">%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Slang.AI Settings */}
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            Slang.AI Configuration
          </h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Hours Saved by Slang.AI (%)
            </label>
            <div className="flex items-center">
              <input
                type="range"
                min="0"
                max="100"
                value={percentSaved}
                onChange={(e) => setPercentSaved(parseInt(e.target.value))}
                className="flex-grow mr-2"
              />
              <span className="w-8 text-center font-medium">{percentSaved}%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Effective rate: {metrics.callAutomationRateWeighted.toFixed(0)}% (based on call types)
            </p>
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
              <option value="799">Advanced Plan ($799.00)</option>
              <option value="999">Enterprise Plan ($999.00)</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Projection Time Period (months)
            </label>
            <select
              value={projectionMonths}
              onChange={(e) => setProjectionMonths(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="3">3 months</option>
              <option value="6">6 months</option>
              <option value="12">12 months</option>
              <option value="24">24 months</option>
              <option value="36">36 months</option>
              <option value="60">60 months</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Call Growth Rate (% yearly)
            </label>
            <div className="flex items-center">
              <input
                type="range"
                min="0"
                max="30"
                value={callGrowthRate}
                onChange={(e) => setCallGrowthRate(parseInt(e.target.value))}
                className="flex-grow mr-2"
              />
              <span className="w-8 text-center font-medium">{callGrowthRate}%</span>
            </div>
          </div>
          
          <div className="mb-4">
            <button
              onClick={() => setShowSeasonality(!showSeasonality)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              {showSeasonality ? 'Hide' : 'Show'} Seasonal Factors
              <svg className={`w-4 h-4 ml-1 transform ${showSeasonality ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showSeasonality && (
              <div className="mt-2 border p-3 rounded-md bg-white">
                <p className="text-xs text-gray-500 mb-2">Set monthly call volume multipliers (1.0 = average)</p>
                <div className="grid grid-cols-4 gap-2">
                  {seasonalityFactors.map((month, index) => (
                    <div key={index} className="mb-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">{month.month}</label>
                      <input
                        type="number"
                        min="0.1"
                        max="5"
                        step="0.05"
                        value={month.factor}
                        onChange={(e) => updateSeasonalFactor(index, parseFloat(e.target.value) || 1)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <button
              onClick={() => setShowHoursOfOperation(!showHoursOfOperation)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              {showHoursOfOperation ? 'Hide' : 'Show'} Business Hours
              <svg className={`w-4 h-4 ml-1 transform ${showHoursOfOperation ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showHoursOfOperation && (
              <div className="mt-2 border p-3 rounded-md bg-white">
                <p className="text-xs text-gray-500 mb-2">Set your business hours for each day</p>
                {Object.entries(hoursOfOperation).map(([day, hours]) => (
                  <div key={day} className="mb-2 flex items-center">
                    <div className="w-24">
                      <label className="text-xs font-medium text-gray-700">
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={hours.enabled}
                        onChange={(e) => updateHoursOfOperation(day, 'enabled', e.target.checked)}
                        className="mr-2"
                      />
                      {hours.enabled && (
                        <>
                          <select
                            value={hours.open}
                            onChange={(e) => updateHoursOfOperation(day, 'open', e.target.value)}
                            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md mr-1"
                            disabled={!hours.enabled}
                          >
                            {Array.from({ length: 24 }).map((_, i) => (
                              <option key={`open-${i}`} value={i}>{i}:00</option>
                            ))}
                          </select>
                          <span className="mx-1">-</span>
                          <select
                            value={hours.close}
                            onChange={(e) => updateHoursOfOperation(day, 'close', e.target.value)}
                            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md"
                            disabled={!hours.enabled}
                          >
                            {Array.from({ length: 24 }).map((_, i) => (
                              <option key={`close-${i}`} value={i+1}>{i+1}:00</option>
                            ))}
                          </select>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <>
          {/* Summary Metrics */}
          <div className="mb-8 bg-blue-50 p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Cost Summary
            </h2>
            
            {/* Primary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                <h3 className="text-sm font-medium text-gray-700">Monthly Cost Without Slang.AI</h3>
                <p className="text-2xl font-bold text-blue-600">${formatCurrency(metrics.currentWithoutSlangAI)}</p>
                <p className="text-xs text-gray-500">Including employee benefits</p>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                <h3 className="text-sm font-medium text-gray-700">Monthly Cost With Slang.AI</h3>
                <p className="text-2xl font-bold text-green-600">${formatCurrency(metrics.currentWithSlangAI)}</p>
                <p className="text-xs text-gray-500">Including subscription cost</p>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200 shadow-sm border-l-4 border-l-green-500">
                <h3 className="text-sm font-medium text-gray-700">Monthly Savings</h3>
                <p className={`text-2xl font-bold ${metrics.monthlySavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.monthlySavings >= 0 ? '+' : ''}{formatCurrency(metrics.monthlySavings)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatPercent(metrics.costReductionPercent)} reduction in costs
                </p>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200 shadow-sm border-l-4 border-l-red-500">
                <h3 className="text-sm font-medium text-gray-700">Break-Even Point</h3>
                {breakEvenPoint ? (
                  <div>
                    <p className="text-2xl font-bold text-red-600">${breakEvenPoint.wage}/hr</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {currentAvgWage >= breakEvenPoint.wage ? 
                        `Current avg wage ($${currentAvgWage.toFixed(2)}/hr) is above break-even point - Slang.AI is cost-effective` :
                        `Current avg wage ($${currentAvgWage.toFixed(2)}/hr) is below break-even point - Slang.AI is not yet cost-effective`
                      }
                    </p>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-gray-400">N/A</p>
                )}
              </div>
            </div>
            
            {/* Metrics View Selection */}
            <div className="flex justify-center mb-3">
              <div className="flex bg-gray-200 rounded-lg p-1">
                <button 
                  className={`px-3 py-1 text-sm rounded-md ${selectedView === 'financial' ? 'bg-white shadow' : ''}`}
                  onClick={() => setSelectedView('financial')}
                >
                  Financial
                </button>
                <button 
                  className={`px-3 py-1 text-sm rounded-md ${selectedView === 'operational' ? 'bg-white shadow' : ''}`}
                  onClick={() => setSelectedView('operational')}
                >
                  Operational
                </button>
                <button 
                  className={`px-3 py-1 text-sm rounded-md ${selectedView === 'revenue' ? 'bg-white shadow' : ''}`}
                  onClick={() => setSelectedView('revenue')}
                >
                  Revenue Impact
                </button>
              </div>
            </div>
            
            {/* Secondary Metrics */}
            <h3 className="text-sm font-medium text-gray-700 mt-4 mb-2">Advanced Metrics</h3>
            {renderAdvancedMetrics()}
          </div>
          
          {/* Visual Charts (Primary) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Cost Breakdown Chart */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-md font-semibold mb-4">Monthly Cost vs. Hourly Wage</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
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
                    <Legend/>
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
<p className="text-xs text-gray-500 mt-2">
  As hourly wages increase, Slang.AI becomes more cost-effective compared to traditional staffing.
</p>
</div>
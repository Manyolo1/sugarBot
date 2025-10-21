import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SugarBot from './components/SugarBot'

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line,
} from 'recharts';

const salesData = [
  { month: 'Jan', sales: 120000 },
  { month: 'Feb', sales: 139000 },
  { month: 'Mar', sales: 115000 },
  { month: 'Apr', sales: 152000 },
  { month: 'May', sales: 160000 },
  { month: 'Jun', sales: 174000 },
];

const commodityData = [
  { name: 'Raw Sugar', value: 407182 },
  { name: 'Refined Sugar', value: 254898 },
  { name: 'Brown Sugar', value: 203426 },
  { name: 'Liquid Sugar', value: 126760 },
];

const costPerUnitData = [
  { month: 'Jan', cost: 90 },
  { month: 'Feb', cost: 92 },
  { month: 'Mar', cost: 89 },
  { month: 'Apr', cost: 91 },
  { month: 'May', cost: 93 },
  { month: 'Jun', cost: 95 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function MockDashboard() {
  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6 text-[#11224E]">Mock Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Stats cards */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow w-full">
          <h2 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-4 text-[#11224E]">Total Sales</h2>
          <p className="text-2xl sm:text-4xl font-bold text-gray-800">$1,237,890</p>
          <p className="text-green-600 mt-1 sm:mt-2">+15% from last month</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={salesData} margin={{ top: 10 }}>
              <XAxis dataKey="month" fontSize={10}/>
              <YAxis fontSize={10}/>
              <Tooltip />
              <Bar dataKey="sales" fill="#016B61" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow w-full">
          <h2 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-4 text-[#11224E]">Commodity Spend Breakdown</h2>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={commodityData} dataKey="value" nameKey="name" outerRadius={50} fill="#8884d8" label>
                {commodityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow w-full">
          <h2 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-4 text-[#11224E]">Avg Cost Per Unit Trend</h2>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={costPerUnitData} margin={{ top: 10 }}>
              <XAxis dataKey="month" fontSize={10}/>
              <YAxis fontSize={10}/>
              <Tooltip />
              <Line type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-red-600 mt-1 sm:mt-2">Slight increase over 6 months</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow flex flex-col justify-between w-full">
          <div>
            <h2 className="font-semibold text-lg sm:text-xl mb-1 sm:mb-2 text-[#11224E]">Active Suppliers</h2>
            <p className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2 text-gray-700">34</p>
            <p className="text-blue-600">Stable supply chain</p>
          </div>
          <div>
            <h2 className="font-semibold text-lg sm:text-xl mb-1 sm:mb-2 mt-4 sm:mt-6 text-[#11224E]">Top Commodity</h2>
            <p className="text-xl sm:text-3xl font-bold text-gray-800">Raw Sugar</p>
            <p className="text-gray-600">Highest spend and volume</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <MockDashboard />
      <SugarBot />
    </>
  );
}

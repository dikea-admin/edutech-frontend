// src/components/Stepper.jsx
import React from 'react';
import { cn } from '../lib/utils'; // Assuming you have shadcn utils

const Stepper = ({ steps, currentStep, onStepClick }) => {
  return (
    <nav aria-label="Progress" className="w-full flex justify-center mb-8">
      <ol role="list" className="flex items-center space-x-5">
        {steps.map((step, index) => (
          <li key={step.id}>
            {index < currentStep ? (
              // Completed Step
              <button
                onClick={() => onStepClick(index)}
                className="group flex flex-col items-center cursor-pointer"
                aria-current={index === currentStep ? 'step' : undefined}
              >
                <span className="flex h-9 items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white group-hover:bg-indigo-800">
                  {step.name}
                </span>
                <span className="text-xs text-gray-500 mt-1">{step.description}</span>
              </button>
            ) : index === currentStep ? (
              // Current Step
              <button
                onClick={() => onStepClick(index)}
                className="flex flex-col items-center cursor-pointer"
                aria-current="step"
              >
                <span className="flex h-9 items-center justify-center rounded-full border-2 border-indigo-600 bg-white px-4 py-2 text-sm font-medium text-indigo-600">
                  {step.name}
                </span>
                <span className="text-xs text-indigo-600 mt-1 font-semibold">{step.description}</span>
              </button>
            ) : (
              // Upcoming Step
              <button
                onClick={() => onStepClick(index)}
                className="group flex flex-col items-center cursor-pointer disabled:cursor-not-allowed"
                aria-current={index === currentStep ? 'step' : undefined}
                disabled // Disable clicking future steps directly until current is valid
              >
                <span className="flex h-9 items-center justify-center rounded-full border-2 border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 group-hover:border-gray-400">
                  {step.name}
                </span>
                <span className="text-xs text-gray-500 mt-1">{step.description}</span>
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Stepper;
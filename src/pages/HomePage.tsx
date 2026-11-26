import React from 'react';
import { HeroSection } from '../sections/HeroSection';
import { ProblemSection } from '../sections/ProblemSection';
import { SolutionSection } from '../sections/SolutionSection';
import { HowItWorksSection } from '../sections/HowItWorksSection';
import { TechStackSection } from '../sections/TechStackSection';
import { AnalyticsDashboardSection } from '../sections/AnalyticsDashboardSection';
import { AnomalyExplainerSection } from '../sections/AnomalyExplainerSection';
import { ObjectivesAndBloomSection } from '../sections/ObjectivesAndBloomSection';
import { RoadmapSection } from '../sections/RoadmapSection';
import { EvaluationCriteriaSection } from '../sections/EvaluationCriteriaSection';
import { SystemArchitectureSection } from '../sections/SystemArchitectureSection';
import { ApiDocsSection } from '../sections/ApiDocsSection';
import { LimitationsAndCtaSection } from '../sections/LimitationsAndCtaSection';

export const HomePage: React.FC = () => {
  return (
    <main>
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <TechStackSection />
      <AnalyticsDashboardSection />
      <AnomalyExplainerSection />
      <ObjectivesAndBloomSection />
      <RoadmapSection />
      <EvaluationCriteriaSection />
      <SystemArchitectureSection />
      <ApiDocsSection />
      <LimitationsAndCtaSection />
    </main>
  );
};

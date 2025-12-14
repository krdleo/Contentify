import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Login } from '../auth/Login';
import { Signup } from '../auth/Signup';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';

// Business pages
import { BusinessDashboard } from '../business/Dashboard';
import { ProjectsList } from '../business/ProjectsList';
import { ProjectCreate } from '../business/ProjectCreate';
import { ProjectDetails } from '../business/ProjectDetails';
import { EngagementList as BusinessEngagementList } from '../business/EngagementList';
import { EngagementDetail as BusinessEngagementDetail } from '../business/EngagementDetail';

// Freelancer pages
import { FreelancerDashboard } from '../freelancer/Dashboard';
import { ProfileView } from '../freelancer/ProfileView';
import { ProfileEdit } from '../freelancer/ProfileEdit';
import { PortfolioList } from '../freelancer/PortfolioList';
import { PortfolioEditor } from '../freelancer/PortfolioEditor';
import { ProjectsFeed } from '../freelancer/ProjectsFeed';
import { ProjectDetail as FreelancerProjectDetail } from '../freelancer/ProjectDetail';
import { MyBids } from '../freelancer/MyBids';
import { EngagementList as FreelancerEngagementList } from '../freelancer/EngagementList';
import { EngagementDetail as FreelancerEngagementDetail } from '../freelancer/EngagementDetail';

// Shared pages
import { ConversationsList } from '../messaging/ConversationsList';
import { ChatView } from '../messaging/ChatView';
import { NotificationsPanel } from '../notifications/NotificationsPanel';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      <Route
        path="/business/*"
        element={
          <ProtectedRoute requiredRole="BUSINESS">
            <Layout>
              <Routes>
                <Route path="dashboard" element={<BusinessDashboard />} />
                <Route path="projects" element={<ProjectsList />} />
                <Route path="projects/create" element={<ProjectCreate />} />
                <Route path="projects/:id" element={<ProjectDetails />} />
                <Route path="engagements" element={<BusinessEngagementList />} />
                <Route path="engagements/:id" element={<BusinessEngagementDetail />} />
                <Route path="*" element={<Navigate to="/business/dashboard" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/freelancer/*"
        element={
          <ProtectedRoute requiredRole="FREELANCER">
            <Layout>
              <Routes>
                <Route path="dashboard" element={<FreelancerDashboard />} />
                <Route path="profile" element={<ProfileView />} />
                <Route path="profile/edit" element={<ProfileEdit />} />
                <Route path="portfolio" element={<PortfolioList />} />
                <Route path="portfolio/edit/:id?" element={<PortfolioEditor />} />
                <Route path="projects" element={<ProjectsFeed />} />
                <Route path="projects/:id" element={<FreelancerProjectDetail />} />
                <Route path="bids" element={<MyBids />} />
                <Route path="engagements" element={<FreelancerEngagementList />} />
                <Route path="engagements/:id" element={<FreelancerEngagementDetail />} />
                <Route path="*" element={<Navigate to="/freelancer/dashboard" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/conversations"
        element={
          <ProtectedRoute>
            <Layout>
              <ConversationsList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/conversations/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <ChatView />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Layout>
              <NotificationsPanel />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};


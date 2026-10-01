import React, { useState, useEffect, useCallback } from 'react';
import { Actor, Claim, ToastNotification, ReviewPayload, ReimbursePayload } from './lib/types';
import { getStoredUser, setStoredUser, clearStoredUser } from './lib/auth';
import {
  fetchClaims,
  uploadClaim,
  managerReview,
  financeReview,
  reimburse,
  raiseAppeal,
} from './lib/api';

import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { HamburgerMenu } from './components/HamburgerMenu';
import { ClaimDrawer } from './components/ClaimDrawer';
import { ReviewModal } from './components/ReviewModal';
import { ReimburseModal } from './components/ReimburseModal';
import { AppealModal } from './components/AppealModal';
import { ToastContainer } from './components/Toast';
import { CookieBanner } from './components/CookieBanner';
import { Footer } from './components/Footer';

// Views
import { SubmitView } from './views/employee/Submit';
import { MyClaimsView } from './views/employee/MyClaims';
import { RejectedView } from './views/employee/Rejected';
import { AppealsView } from './views/employee/Appeals';
import { EmployeeDashboardView } from './views/employee/Dashboard';

import { ManagerPendingView } from './views/manager/Pending';
import { TeamClaimsView } from './views/manager/TeamClaims';
import { ManagerRejectedView } from './views/manager/Rejected';
import { ManagerDashboardView } from './views/manager/Dashboard';

import { FinanceManagerApprovedView } from './views/finance/ManagerApproved';
import { FinanceReadyToReimburseView } from './views/finance/ReadyToReimburse';
import { FinanceReimbursedView } from './views/finance/Reimbursed';
import { FinanceDashboardView } from './views/finance/Dashboard';

import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { NotFound } from './pages/NotFound';

export default function App() {
  const [currentUser, setCurrentUser] = useState<Actor | null>(() => getStoredUser());

  const [currentView, setCurrentView] = useState<string>('my_claims');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);

  // Modals
  const [reviewModalClaim, setReviewModalClaim] = useState<Claim | null>(null);
  const [reviewStage, setReviewStage] = useState<'manager' | 'finance'>('manager');
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const [reimburseClaim, setReimburseClaim] = useState<Claim | null>(null);
  const [isReimburseOpen, setIsReimburseOpen] = useState(false);

  const [appealClaim, setAppealClaim] = useState<Claim | null>(null);
  const [isAppealOpen, setIsAppealOpen] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load claims on user change
  const refreshClaims = useCallback(async (user: Actor | null) => {
    if (!user?.apiKey) return;
    try {
      const data = await fetchClaims(user.apiKey);
      setClaims(data);
    } catch {
      addToast('error', 'FAILED TO LOAD CLAIMS', 'Fallback to cached registry');
    }
  }, [addToast]);

  useEffect(() => {
    if (currentUser) {
      refreshClaims(currentUser);
      if (currentUser.role === 'employee') setCurrentView('my_claims');
      else if (currentUser.role === 'manager') setCurrentView('pending');
      else if (currentUser.role === 'finance') setCurrentView('ready_to_reimburse');
      else if (currentUser.role === 'admin') setCurrentView('all_claims');
    }
  }, [currentUser, refreshClaims]);

  // Auth handlers
  const handleSelectActor = (actor: Actor) => {
    setStoredUser(actor);
    setCurrentUser(actor);
    addToast('success', 'IDENTITY VERIFIED', `Authenticated as ${actor.name} (${actor.role.toUpperCase()})`);
  };

  const handleSignOut = () => {
    localStorage.removeItem('fin21_session');
    clearStoredUser();
    setCurrentUser(null);
    setSelectedClaim(null);
    window.location.reload();
  };

  // Action handlers
  const handleUploadSubmit = async (formData: FormData) => {
    if (!currentUser) return;
    setIsSubmitting(true);
    try {
      const created = await uploadClaim(currentUser.apiKey, formData, {
        actorId: currentUser.actorId,
        name: currentUser.name,
        role: currentUser.role,
      });

      await refreshClaims(currentUser);
      setSelectedClaim(created);
      setCurrentView('my_claims');

      if (created.status === 'AUTO_APPROVED') {
        addToast('success', 'CLAIM AUTO-APPROVED', `${created.claim_number} passed 100% compliance checks.`);
      } else {
        addToast('info', 'CLAIM SUBMITTED', `${created.claim_number} queued for manager compliance review.`);
      }
    } catch (err: any) {
      addToast('error', 'SUBMISSION FAILED', err?.message || 'Verification could not proceed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManagerApprove = async (claim: Claim) => {
    if (!currentUser) return;
    try {
      const updated = await managerReview(
        currentUser.apiKey,
        claim.id,
        { decision: 'approve' },
        { actorId: currentUser.actorId, role: currentUser.role, name: currentUser.name }
      );
      await refreshClaims(currentUser);
      if (selectedClaim?.id === claim.id) setSelectedClaim(updated);
      addToast('success', 'CLAIM APPROVED', `${claim.claim_number} advanced to Finance queue.`);
    } catch (err: any) {
      addToast('error', 'APPROVAL FAILED', err?.message);
    }
  };

  const handleFinanceApprove = async (claim: Claim) => {
    if (!currentUser) return;
    try {
      const updated = await financeReview(
        currentUser.apiKey,
        claim.id,
        { decision: 'approve' },
        { actorId: currentUser.actorId, role: currentUser.role, name: currentUser.name }
      );
      await refreshClaims(currentUser);
      if (selectedClaim?.id === claim.id) setSelectedClaim(updated);
      addToast('success', 'FINANCE CLEARED', `${claim.claim_number} approved for disbursement.`);
    } catch (err: any) {
      addToast('error', 'FINANCE REVIEW FAILED', err?.message);
    }
  };

  const handleOpenRejectModal = (claim: Claim, stage: 'manager' | 'finance' = 'manager') => {
    setReviewModalClaim(claim);
    setReviewStage(stage);
    setIsReviewOpen(true);
  };

  const handleConfirmReject = async (claimId: number, payload: ReviewPayload) => {
    if (!currentUser) return;
    try {
      const fn = reviewStage === 'manager' ? managerReview : financeReview;
      const updated = await fn(
        currentUser.apiKey,
        claimId,
        payload,
        { actorId: currentUser.actorId, role: currentUser.role, name: currentUser.name }
      );
      await refreshClaims(currentUser);
      if (selectedClaim?.id === claimId) setSelectedClaim(updated);
      addToast('error', 'CLAIM REJECTED', `Claim rejected: ${payload.rejection_reason}`);
    } catch (err: any) {
      addToast('error', 'REJECTION FAILED', err?.message);
    }
  };

  const handleOpenReimburseModal = (claim: Claim) => {
    setReimburseClaim(claim);
    setIsReimburseOpen(true);
  };

  const handleConfirmReimburse = async (claimId: number, payload: ReimbursePayload) => {
    if (!currentUser) return;
    try {
      const updated = await reimburse(currentUser.apiKey, claimId, payload, {
        actorId: currentUser.actorId,
        role: currentUser.role,
        name: currentUser.name,
      });
      await refreshClaims(currentUser);
      if (selectedClaim?.id === claimId) setSelectedClaim(updated);
      addToast('success', 'REIMBURSEMENT EXECUTED', `Settled with bank reference ${payload.reimbursement_reference}`);
    } catch (err: any) {
      addToast('error', 'REIMBURSEMENT FAILED', err?.message);
    }
  };

  const handleOpenAppealModal = (claim: Claim) => {
    setAppealClaim(claim);
    setIsAppealOpen(true);
  };

  const handleConfirmAppeal = async (claimId: number, notes: string) => {
    if (!currentUser) return;
    try {
      const updated = await raiseAppeal(claimId, notes, {
        actorId: currentUser.actorId,
        role: currentUser.role,
        name: currentUser.name,
      });
      await refreshClaims(currentUser);
      if (selectedClaim?.id === claimId) setSelectedClaim(updated);
      addToast('info', 'APPEAL REGISTERED', 'Mitigating explanation recorded for arbitration review.');
    } catch (err: any) {
      addToast('error', 'APPEAL SUBMISSION FAILED', err?.message);
    }
  };

  // Login gate
  if (!currentUser) {
    return <LoginPage onSuccess={handleSelectActor} />;
  }

  const getPageTitle = (): string => {
    switch (currentView) {
      case 'submit': return 'SUBMIT EXPENSE';
      case 'my_claims': return 'MY CLAIMS';
      case 'rejected': return 'REJECTED & FLAGGED';
      case 'appeals': return 'APPEALS LEDGER';
      case 'pending': return 'PENDING REVIEW';
      case 'team_claims': return 'TEAM CLAIMS';
      case 'all_claims': return 'ALL CLAIMS REGISTER';
      case 'manager_approved': return 'MANAGER APPROVED';
      case 'ready_to_reimburse': return 'READY TO PAY';
      case 'reimbursed': return 'REIMBURSED ARCHIVE';
      case 'dashboard': return 'AUDIT METRICS';
      case 'privacy': return 'PRIVACY POLICY';
      case 'terms': return 'TERMS OF SERVICE';
      default: return 'WORKSPACE';
    }
  };

  const renderContent = () => {
    if (currentView === 'privacy') {
      return <Privacy onBack={() => setCurrentView('dashboard')} />;
    }
    if (currentView === 'terms') {
      return <Terms onBack={() => setCurrentView('dashboard')} />;
    }
    if (currentView === 'not_found') {
      return <NotFound onBackHome={() => setCurrentView('dashboard')} />;
    }

    // Employee Views
    if (currentUser.role === 'employee') {
      switch (currentView) {
        case 'submit':
          return <SubmitView user={currentUser} onSubmit={handleUploadSubmit} isSubmitting={isSubmitting} />;
        case 'my_claims':
          return <MyClaimsView user={currentUser} claims={claims} onSelectClaim={setSelectedClaim} onOpenSubmit={() => setCurrentView('submit')} />;
        case 'rejected':
          return <RejectedView user={currentUser} claims={claims} onSelectClaim={setSelectedClaim} onOpenAppeal={handleOpenAppealModal} />;
        case 'appeals':
          return <AppealsView user={currentUser} claims={claims} onSelectClaim={setSelectedClaim} onOpenAppeal={handleOpenAppealModal} />;
        case 'dashboard':
          return <EmployeeDashboardView user={currentUser} claims={claims} onSelectClaim={setSelectedClaim} onOpenSubmit={() => setCurrentView('submit')} />;
        default:
          return <MyClaimsView user={currentUser} claims={claims} onSelectClaim={setSelectedClaim} onOpenSubmit={() => setCurrentView('submit')} />;
      }
    }

    // Manager Views
    if (currentUser.role === 'manager') {
      switch (currentView) {
        case 'pending':
          return <ManagerPendingView user={currentUser} claims={claims} onSelectClaim={setSelectedClaim} onApprove={handleManagerApprove} onReject={(c) => handleOpenRejectModal(c, 'manager')} />;
        case 'team_claims':
          return <TeamClaimsView user={currentUser} claims={claims} onSelectClaim={setSelectedClaim} onApprove={handleManagerApprove} onReject={(c) => handleOpenRejectModal(c, 'manager')} />;
        case 'rejected':
          return <ManagerRejectedView user={currentUser} claims={claims} onSelectClaim={setSelectedClaim} />;
        case 'dashboard':
          return <ManagerDashboardView user={currentUser} claims={claims} onSelectClaim={setSelectedClaim} onNavigatePending={() => setCurrentView('pending')} />;
        default:
          return <ManagerPendingView user={currentUser} claims={claims} onSelectClaim={setSelectedClaim} onApprove={handleManagerApprove} onReject={(c) => handleOpenRejectModal(c, 'manager')} />;
      }
    }

    // Finance Views
    if (currentUser.role === 'finance') {
      switch (currentView) {
        case 'manager_approved':
          return <FinanceManagerApprovedView user={currentUser} claims={claims} onSelectClaim={setSelectedClaim} onApprove={handleFinanceApprove} onReject={(c) => handleOpenRejectModal(c, 'finance')} />;
        case 'ready_to_reimburse':
          return <FinanceReadyToReimburseView user={currentUser} claims={claims} onSelectClaim={setSelectedClaim} onOpenReimburse={handleOpenReimburseModal} />;
        case 'reimbursed':
          return <FinanceReimbursedView user={currentUser} claims={claims} onSelectClaim={setSelectedClaim} />;
        case 'dashboard':
          return <FinanceDashboardView user={currentUser} claims={claims} onSelectClaim={setSelectedClaim} onNavigateReady={() => setCurrentView('ready_to_reimburse')} />;
        default:
          return <FinanceReadyToReimburseView user={currentUser} claims={claims} onSelectClaim={setSelectedClaim} onOpenReimburse={handleOpenReimburseModal} />;
      }
    }

    // Admin Views
    if (currentUser.role === 'admin') {
      switch (currentView) {
        case 'all_claims':
          return <MyClaimsView user={currentUser} claims={claims} onSelectClaim={setSelectedClaim} onOpenSubmit={() => setCurrentView('submit')} />;
        case 'submit':
          return <SubmitView user={currentUser} onSubmit={handleUploadSubmit} isSubmitting={isSubmitting} />;
        case 'pending':
          return <ManagerPendingView user={currentUser} claims={claims} onSelectClaim={setSelectedClaim} onApprove={handleManagerApprove} onReject={(c) => handleOpenRejectModal(c, 'manager')} />;
        case 'ready_to_reimburse':
          return <FinanceReadyToReimburseView user={currentUser} claims={claims} onSelectClaim={setSelectedClaim} onOpenReimburse={handleOpenReimburseModal} />;
        case 'dashboard':
          return <ManagerDashboardView user={currentUser} claims={claims} onSelectClaim={setSelectedClaim} onNavigatePending={() => setCurrentView('pending')} />;
        default:
          return <MyClaimsView user={currentUser} claims={claims} onSelectClaim={setSelectedClaim} onOpenSubmit={() => setCurrentView('submit')} />;
      }
    }

    return <NotFound onBackHome={() => setCurrentView('dashboard')} />;
  };

  return (
    <div className="min-h-screen bg-[#EDE8DF] text-[#0F0F0F] flex selection:bg-[#C8352B] selection:text-[#EDE8DF]">
      {/* Persistent Sidebar — hidden on mobile, visible ≥768px */}
      <Sidebar
        user={currentUser}
        activeView={currentView}
        onNavigate={setCurrentView}
        onSignOut={handleSignOut}
      />

      {/* Main content column */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <TopBar
          user={currentUser}
          pageTitle={getPageTitle()}
          onOpenMenu={() => setIsMenuOpen(true)}
          onNavigateHome={() => setCurrentView('dashboard')}
        />

        <HamburgerMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          user={currentUser}
          currentView={currentView}
          onSelectView={setCurrentView}
          onSignOut={handleSignOut}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12">
          {renderContent()}
        </main>

        <Footer
          onOpenPrivacy={() => setCurrentView('privacy')}
          onOpenTerms={() => setCurrentView('terms')}
          onNavigateHome={() => setCurrentView('dashboard')}
        />
      </div>

      {/* Overlays — fixed position, do not affect flex layout */}
      <ClaimDrawer
        claim={selectedClaim}
        onClose={() => setSelectedClaim(null)}
        currentUser={currentUser}
        onOpenAppeal={handleOpenAppealModal}
        onOpenReject={(c) => handleOpenRejectModal(c, currentUser.role === 'finance' ? 'finance' : 'manager')}
        onOpenReimburse={handleOpenReimburseModal}
        onManagerApprove={handleManagerApprove}
        onFinanceApprove={handleFinanceApprove}
      />

      <ReviewModal
        claim={reviewModalClaim}
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        onConfirm={handleConfirmReject}
        stage={reviewStage}
      />

      <ReimburseModal
        claim={reimburseClaim}
        isOpen={isReimburseOpen}
        onClose={() => setIsReimburseOpen(false)}
        onConfirm={handleConfirmReimburse}
      />

      <AppealModal
        claim={appealClaim}
        isOpen={isAppealOpen}
        onClose={() => setIsAppealOpen(false)}
        onSubmitAppeal={handleConfirmAppeal}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <CookieBanner />
    </div>
  );
}
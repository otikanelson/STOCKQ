import { useAuth } from '../context/AuthContext';

export type FeaturePermission = 
  | 'viewProducts'
  | 'scanProducts'
  | 'registerProducts'
  | 'addProducts'
  | 'processSales';

interface FeatureAccessResult {
  isAllowed: boolean;
  reason?: string;
  isStaffWithoutPermission: boolean;
}

export const useFeatureAccess = (requiredPermission?: FeaturePermission): FeatureAccessResult => {
  const { user, role } = useAuth();

  // Admin has full access
  if (role === 'admin') {
    return {
      isAllowed: true,
      isStaffWithoutPermission: false,
    };
  }

  // If no specific permission required, allow
  if (!requiredPermission) {
    return {
      isAllowed: true,
      isStaffWithoutPermission: false,
    };
  }

  // Check staff permissions
  const hasPermission = user?.permissions?.[requiredPermission] ?? false;

  if (!hasPermission) {
    return {
      isAllowed: false,
      reason: `You don't have permission to ${getPermissionLabel(requiredPermission)}`,
      isStaffWithoutPermission: true,
    };
  }

  return {
    isAllowed: true,
    isStaffWithoutPermission: false,
  };
};

const getPermissionLabel = (permission: FeaturePermission): string => {
  const labels: Record<FeaturePermission, string> = {
    viewProducts: 'view products',
    scanProducts: 'scan products',
    registerProducts: 'register products',
    addProducts: 'add inventory',
    processSales: 'process sales',
  };
  return labels[permission];
};

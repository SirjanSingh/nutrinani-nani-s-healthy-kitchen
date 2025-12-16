import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';

const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;

// Demo mode when Cognito is not configured
export const isDemoAuth = !userPoolId || !clientId;

let userPool: CognitoUserPool | null = null;

if (!isDemoAuth) {
  userPool = new CognitoUserPool({
    UserPoolId: userPoolId,
    ClientId: clientId,
  });
}

// Demo user for when Cognito is not configured
const DEMO_USER = {
  email: 'demo@nutrinani.com',
  name: 'Demo User',
};

const DEMO_TOKEN = 'demo-jwt-token';

export interface AuthUser {
  email: string;
  name?: string;
}

// Local storage keys for demo mode
const DEMO_SESSION_KEY = 'nutrinani_demo_session';

export async function signUp(email: string, password: string, name?: string): Promise<void> {
  if (isDemoAuth) {
    // Demo mode: simulate signup
    await new Promise(resolve => setTimeout(resolve, 1000));
    localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({ email, name: name || email.split('@')[0] }));
    return;
  }

  return new Promise((resolve, reject) => {
    const attributeList: CognitoUserAttribute[] = [];
    
    if (name) {
      attributeList.push(new CognitoUserAttribute({ Name: 'name', Value: name }));
    }

    userPool!.signUp(email, password, attributeList, [], (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

export async function confirmSignUp(email: string, code: string): Promise<void> {
  if (isDemoAuth) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return;
  }

  const cognitoUser = new CognitoUser({
    Username: email,
    Pool: userPool!,
  });

  return new Promise((resolve, reject) => {
    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  if (isDemoAuth) {
    // Demo mode: accept any credentials or specific demo credentials
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo, accept demo@nutrinani.com/demo123 or any credentials
    const user = { email, name: email.split('@')[0] };
    localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(user));
    return user;
  }

  const cognitoUser = new CognitoUser({
    Username: email,
    Pool: userPool!,
  });

  const authDetails = new AuthenticationDetails({
    Username: email,
    Password: password,
  });

  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (session: CognitoUserSession) => {
        const payload = session.getIdToken().payload;
        resolve({
          email: payload.email || email,
          name: payload.name,
        });
      },
      onFailure: (err) => {
        reject(err);
      },
      newPasswordRequired: () => {
        reject(new Error('New password required'));
      },
    });
  });
}

export async function signOut(): Promise<void> {
  if (isDemoAuth) {
    localStorage.removeItem(DEMO_SESSION_KEY);
    return;
  }

  const cognitoUser = userPool?.getCurrentUser();
  if (cognitoUser) {
    cognitoUser.signOut();
  }
}

export async function getAccessToken(): Promise<string | null> {
  if (isDemoAuth) {
    const session = localStorage.getItem(DEMO_SESSION_KEY);
    return session ? DEMO_TOKEN : null;
  }

  const cognitoUser = userPool?.getCurrentUser();
  if (!cognitoUser) return null;

  return new Promise((resolve, reject) => {
    cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session) {
        resolve(null);
        return;
      }
      resolve(session.getAccessToken().getJwtToken());
    });
  });
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (isDemoAuth) {
    const session = localStorage.getItem(DEMO_SESSION_KEY);
    if (session) {
      try {
        return JSON.parse(session);
      } catch {
        return null;
      }
    }
    return null;
  }

  const cognitoUser = userPool?.getCurrentUser();
  if (!cognitoUser) return null;

  return new Promise((resolve) => {
    cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session) {
        resolve(null);
        return;
      }
      
      cognitoUser.getUserAttributes((err, attributes) => {
        if (err || !attributes) {
          const payload = session.getIdToken().payload;
          resolve({
            email: payload.email,
            name: payload.name,
          });
          return;
        }

        const email = attributes.find(a => a.Name === 'email')?.Value || '';
        const name = attributes.find(a => a.Name === 'name')?.Value;
        resolve({ email, name });
      });
    });
  });
}

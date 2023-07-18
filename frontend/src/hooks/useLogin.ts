import {AuthenticationDetails, CognitoUserPool, CognitoUser} from 'amazon-cognito-identity-js';
import {useState} from 'react';

const poolData = {
    UserPoolId: import.meta.env.VITE_USER_POOL as string, // Your user pool id here
    ClientId: import.meta.env.VITE_CLIENT_ID as string // Your client id here
};

const userPool = new CognitoUserPool(poolData);

export function useLogin(): [(credentials: { email: string, password: string }) => void, string, string, Error | undefined] {
    const [result, setResult] = useState<string>('');
    const [loggedUser, setLoggedUser] = useState<string>('');
    const [error, setError] = useState<Error>();

    function login({email, password}: { email: string, password: string }) {
        const cognitoUser = new CognitoUser({
            Username: email,
            Pool: userPool
        });

        const authenticationDetails = new AuthenticationDetails({
            Username: email,
            Password: password
        });

        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                const accessToken = result.getIdToken().getJwtToken();
                setResult(accessToken);
                setLoggedUser(result.getIdToken().payload as unknown as string);
            },

            onFailure: function (err: Error) {
                setError(err);
            },

            newPasswordRequired: function (_, requiredAttributes: string[]) {
                const attributes = [];
                for (let i = 0; i < requiredAttributes.length; i++) {
                    attributes.push({
                        Name: requiredAttributes[i],
                        Value: null
                    });
                }
                cognitoUser.completeNewPasswordChallenge(password, attributes, this);
            }
        });
    }

    return [login, result, loggedUser, error];
}
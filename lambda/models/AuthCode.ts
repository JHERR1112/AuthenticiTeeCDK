export class AuthCode {

    uniqueAuthCode: string;
    isAuthenticated: boolean;
    authenticationAttempts: number;
    lastAuthenticationAttempt: Date;

    constructor() {
        this.uniqueAuthCode = this.generateUniqueCode();
        this.isAuthenticated = false;
        this.authenticationAttempts = 0;
    }

    private generateUniqueCode() {
        const length = 10;
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

}
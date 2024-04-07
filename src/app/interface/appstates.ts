import { DataState } from "../enum/datastate.enum";
import { Customer } from "./customer";
import { Events } from "./event";
import { Invoice } from "./invoice";
import { Role } from "./role";
import { Stats } from "./stats";
import { User } from "./user";

export interface LoginState {
    dataState: DataState;
    loginSuccess?: boolean;
    error?: string;
    message?: string;
    isUsingMfa?: boolean;
    phone?: string;
}

export interface CustomHttpResponse<T> {
    timestamp: Date;
    statusCode: number;
    status: string;
    message: string;
    reason?: string;
    developerMessage?: string;
    // data?: any;
    data?: T;
}

export interface Profile {
    user: User;
    events?: Events[];
    roles?: Role[];
    access_token?: string;
    refresh_token?: string;
}

export interface Page<T> {
    // content: Customer[];
    content: T[];
    totalPages: number;
    totalElements: number;
    numberOfElements: number;
    size: number;
    number: number;

}


// undo
export interface UserData {
    user: User;
    // customers: Page; //customers name come form backend controller /list
    page: Page<any>;
    stats: Stats;
}

export interface UserPage {
    user: User;
    // customers: Page; //customers name come form backend controller /list
    page: Page<any>;
    // page: Page<Invoice>; //might need to do more appstates
}


export interface CustomerState {
    user: User;
    customer: Customer;
}


export interface CustomersState {
    user: User;
    customers: Customer[];
}

export interface RegisterState {
    dataState: DataState;
    registerSuccess?: boolean;
    error?: string;
    message?: string;
}

export type AccountType = 'account' | 'password';

export interface VerifyState {
    dataState: DataState;
    verifySuccess?: boolean;
    error?: string;
    message?: string;
    title?: string;
    type?: AccountType;
}
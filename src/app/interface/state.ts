import { DataState } from "../enum/datastate.enum";

//application wide state
export interface State<T> {
    dataState: DataState;
    appData?: T;
    error?: string;
}

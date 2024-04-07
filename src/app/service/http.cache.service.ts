import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';


@Injectable()

export class HttpCacheService {

    private httpResponseCache: { [key: string]: HttpResponse<any> } = {};

    // key is like the http url
    put = (key: string, httpResponse: HttpResponse<any>): void => {
        console.log('Caching response', httpResponse)
        this.httpResponseCache[key] = httpResponse;
    }

    // get the cached response
    get = (key: string): HttpResponse<any> | null | undefined => {
        // console.log(key)
        console.log('Cache:', this.httpResponseCache);
        return this.httpResponseCache[key];
    }

    evict = (key: string): boolean => delete this.httpResponseCache[key];

    evictAll = (): void => {
        console.log('Evicting all cache');
        this.httpResponseCache = {};
    }

    logCache = (): void => console.log(this.httpResponseCache);


    //to use this this.httpCacheService.evictCacheEntry('http://localhost:8080/customer/list?page=0');
    // in the login component 
    evictCacheEntry = (key: string): void => {
        if (this.httpResponseCache[key]) {
            delete this.httpResponseCache[key];
        }
    }

}

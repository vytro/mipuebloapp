import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ExtractArrayValuePipe } from '../pipes/extractvalue.pipe';

@NgModule({
    declarations: [
        ExtractArrayValuePipe
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule
    ],
    exports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ExtractArrayValuePipe
    ]
})
export class SharedModule { }

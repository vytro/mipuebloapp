import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Observable, BehaviorSubject, switchMap, map, startWith, catchError, of } from 'rxjs';
import { DataState } from 'src/app/enum/datastate.enum';
import { CustomHttpResponse } from 'src/app/interface/appstates';
import { Customer } from 'src/app/interface/customer';
import { Invoice } from 'src/app/interface/invoice';
import { State } from 'src/app/interface/state';
import { User } from 'src/app/interface/user';
import { CustomerService } from 'src/app/service/customer.service';
import { UserService } from 'src/app/service/user.service';

// npm i jspdf
import { jsPDF as pdf } from 'jspdf';
import { NotificationService } from 'src/app/service/notification.service';

//npm install --save html2pdf.js   
// import * as html2pdf from 'html2pdf.js';

//npm install --save html2canvas pdfmake
// import html2canvas from 'html2canvas';
// import pdfMake from 'pdfmake/build/pdfmake';
// import pdfFonts from 'pdfmake/build/vfs_fonts';

// import * as html2pdf from 'html2pdf.js';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class InvoiceDetailComponent implements OnInit {
  invoiceState$: Observable<State<CustomHttpResponse<{ customer: Customer, invoice: Invoice, user: User }>>> | undefined;
  private dataSubject = new BehaviorSubject<CustomHttpResponse<{ customer: Customer, invoice: Invoice, user: User }>>({} as CustomHttpResponse<{ customer: Customer, invoice: Invoice, user: User }>);

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();

  readonly DataState = DataState;
  private readonly INVOICE_ID: string = 'id';

  constructor(private activatedRoute: ActivatedRoute, private customerService: CustomerService,
    private notificationService: NotificationService) { }

  ngOnInit(): void {
    console.log('Function Fired, ngOnInit, invoice.component.ts')
    this.invoiceState$ = this.activatedRoute.paramMap.pipe(
      switchMap((params: ParamMap) => {
        return this.customerService.invoice$(Number(params?.get(this.INVOICE_ID)) ?? 0)
          .pipe(
            map(response => {
              console.log(response);
              this.notificationService.onDefault(response.message);
              this.dataSubject.next(response);
              return { dataState: DataState.LOADED, appData: response };
            }),
            startWith({ dataState: DataState.LOADING }),
            catchError((error: string) => {
              this.notificationService.onError(error);
              return of({ dataState: DataState.ERROR, error })
            })
          )
      })
    );
  }


  //og
  // exportAsPDF() {
  //   const filename = `invoice-${this.dataSubject.value.data?.invoice?.invoiceNumber}.pdf`;
  //   const doc = new pdf();
  //   doc.html(document.getElementById('invoice') as HTMLElement,
  //     { margin: 5, windowWidth: 1000, width: 200, callback: (invoice) => invoice.save(filename) });
  // }

  //saves text correctly to pdf but 8 pages
  // exportAsPDF2() {
  //   const filename = `invoice-${this.dataSubject.value.data?.invoice?.invoiceNumber}.pdf`;
  //   // const doc = new pdf();

  //   const doc = new pdf('p', 'mm', 'a4');
  //   var width = doc.internal.pageSize.getWidth();
  //   var height = doc.internal.pageSize.getHeight() / 2;


  //   doc.html(document.getElementById('invoice') as HTMLElement,
  //     { margin: 5, windowWidth: 1000, width: 100, callback: (invoice) => invoice.save(filename) });
  // }

  //saves as an image pdf
  // exportAsPDF3() {
  //   const element = document.getElementById('invoice');
  //   if (element) {
  //     html2canvas(element).then(canvas => {
  //       const imgData = canvas.toDataURL('image/png');
  //       const docDefinition = {
  //         content: [{
  //           image: imgData,
  //           width: 500
  //         }]
  //       };
  //       pdfMake.createPdf(docDefinition).download("invoice.pdf");
  //     });
  //   }
  // }

  //saves as an image pdf
  // exportAsPDF4() {
  //   const element = document.getElementById('invoice');
  //   html2pdf()
  //     .from(element)
  //     .save();
  // }

  exportAsPDF() {
    const filename = `invoice-${this.dataSubject.value.data?.invoice?.invoiceNumber}.pdf`;
    // const doc = new pdf('p', 'pt', [595.28, 841.89]);
    const doc = new pdf();
    doc.html(document.getElementById('invoice') as HTMLElement, {
      // html2canvas: { scale: 0.5 },
      margin: 5, windowWidth: 1000, width: 200,
      callback: (invoice) => {
        const totalPages = invoice.getNumberOfPages();
        // console.log(totalPages);
        // for (let i = 1; i <= totalPages; i++) {
        //   invoice.setPage(i);
        //   invoice.text(`Page ${i} of ${totalPages}`, 10, 10);
        // }
        for (let i = 2; i <= totalPages + 2; i++) {
          invoice.deletePage(i);
          console.log(i);
        }
        for (let i = 2; i <= totalPages + 2; i++) {
          invoice.deletePage(i);
          // console.log(i);
        }
        invoice.deletePage(2);
        invoice.save(filename);
      }
    });
  }


}

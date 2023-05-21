import { HttpClient } from '@angular/common/http';
import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
export function OnIFrameSave(data) {
}
export function OnIFrameError(error) {
  if (!error) {
    return;
  }
  window.alert(error);
}
@Component({
  selector: 'app-hostedpayment-dialog',
  templateUrl: './hostedpayment-dialog.component.html',
  styleUrls: ['./hostedpayment-dialog.component.scss']
})

export class HostedpaymentDialogComponent implements OnInit {
  public paymentData: any = {};
  public iFrameUrl: any;
  constructor(public sanitizer: DomSanitizer, public http: HttpClient, public dialogRef: MatDialogRef<HostedpaymentDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.dialogRef.disableClose = true;
  }
  @HostListener('window:message', ['$event'])
  onMessage(e) {
    if (e.data.event == 'cardSaved') {
      // e.data nexio card event
      this.dialogRef.close(e.data.data);
    } else if (e.data.isTestCardEvent == true) {
      // e.data test card event
      this.dialogRef.close(e.data);
    } else {
      // e.data. has no event in NMI case so handling this case
      if(e.data.firstSix && e.data.firstSix != '' && e.data.firstSix != undefined && e.data.firstSix != null && 
        e.data.lastFour && e.data.lastFour != '' && e.data.lastFour != undefined && e.data.lastFour != null&&
        e.data.token && e.data.token != '' && e.data.token != undefined && e.data.token != null){
            this.dialogRef.close(e.data);
      }else{
        console.log('error','please enter valid values')
      }
    }
  }
  @HostListener('window:OnIFrameSave', ['$event'])
  OnIFrameSave(e) {
  }
  @HostListener('window:OnIFrameError', ['$event'])
  OnIFrameError(e) {

  }
  ngOnInit(): void {
    this.paymentData = this.data;
    this.setUpIframeMethods();
    this.executePaymentScripts(this.paymentData.Script);
    this.iFrameUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.paymentData.IFrameUrl);
  }
  onConfirm(): void {
    // Close the dialog, return true
    this.dialogRef.close(true);
  }

  onDismiss(): void {
    // Close the dialog, return false
    this.dialogRef.close(false);
  }
  getIframeHeight(): string {
    return this.paymentData.Height;
  }

  getIframeUrl(): any {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.paymentData.IFrameUrl);
  }

  getIframeWidth(): string {
    return this.paymentData.Width;
  }


  executePaymentScripts(html) {
    // Extract, load and execute <script src> tags
    // Extract and execute <script> tags with inline javascript

    const externalScripts = this.getExternalScripts(html);
    html = this.removeExternalScriptTags(html);

    this.runExternalScripts(externalScripts).then(() => {
      const inlineScripts = this.getInlineScripts(html);
      this.runInlineScripts(inlineScripts);
    });
  }

  getExternalScripts(html) {
    const externalScriptOpenRegex = /<script[^>]*src="[^"]*"[^>]*>/g;
    const srcAttrRegex = /src="([^"]*)"/;

    const scriptTags = html.match(externalScriptOpenRegex);

    if (!scriptTags) {
      return [];
    }

    return scriptTags.map((tag) => {
      const link = srcAttrRegex.exec(tag);

      if (!link) {
        return null;
      }

      // Index 1 is the first capture group result
      return link[1];
    }).filter((link) => {
      return !!link;
    });
  }

  getInlineScripts(html) {
    const inlineScriptTagRegex = /<script[^>]*>([\s\S]*)<\/script>/g;
    const scriptTags = html.match(inlineScriptTagRegex);

    if (!scriptTags) {
      return [];
    }

    return scriptTags.map((tag) => {
      const script = inlineScriptTagRegex.exec(tag);

      if (!script) {
        return null;
      }

      // Index 1 is the first capture group result
      return script[1];
    }).filter((script) => {
      return !!script;
    });
  }

  removeExternalScriptTags(html) {
    const externalScriptRegex = /<script[^>]*src="[^"]*"[^>]*>.*<\/script>/g;
    return html.replace(externalScriptRegex, '');
  }

  runExternalScripts(urlArray) {
    const promise = new Promise((resolve, reject) => {
      const firstScript = urlArray.splice(0, 1)[0];
      if (!firstScript) {
        resolve(true);
        return promise;
      }

      this.http.get<any>(firstScript).subscribe(() => {
        this.runExternalScripts(urlArray);
        resolve(true);
      });
    });
    return promise;
  }
  runInlineScripts(scriptArray) {
    window.eval(scriptArray.join('\n;\n'));
  }
  setUpIframeMethods() {
    window['OnIFrameSave'] = OnIFrameSave;
    window['OnIFrameError'] = OnIFrameError;
  }
}

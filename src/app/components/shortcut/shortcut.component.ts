import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-shortcut',
  templateUrl: './shortcut.component.html',
  styleUrls: ['./shortcut.component.css'],
  providers: [NgbAlertConfig]
})

export class ShortcutComponent  implements OnInit {

  public alertMessage: string = '';
  public userType: string;
  public focusEvent = new EventEmitter<boolean>();
  public dominio: string;
  public shortcut: {
    name: string,
    url: string
  };
  @Input() shortcuts: any[];
  @Output() eventAddShortcut: EventEmitter<any[]> = new EventEmitter<any[]>();

  constructor(
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
  ) {
    this.shortcut = {
      name: "",
      url: ""
    };
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    if(window.location.href.includes('/#/')) {
      this.dominio = window.location.href.split('/#/')[0] + '/#/';
    }

    if(!this.shortcuts) {
      this.shortcuts = new Array();
    }
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public addShortcut() {
    if(this.shortcut && this.shortcut.name && this.shortcut.name !== '' &&
      this.shortcut.url && this.shortcut.url !== '') {
        if(!this.existsShortcut()) {
          this.shortcuts.push(this.shortcut);
          this.eventAddShortcut.emit(this.shortcuts);
          this.shortcut = {
            name: "",
            url: ""
          };
        } else {
          this.showMessage('El acceso directo ya existe.', 'info', true);
        }
    } else {
      this.showMessage('Debe completar todos los campos.', 'info', true);
    }
  }

  public existsShortcut(): boolean {

    let exists: boolean = false;

    if(this.shortcuts && this.shortcuts.length > 0) {
      for(let i=0; i < this.shortcuts.length; i++) {
        if(this.shortcuts[i].name === this.shortcut.name || 
          this.shortcuts[i].url === this.shortcut.url) {
          exists = true;
        }
      }
    }

    return exists;
  }

  public deleteShortcut(shortcut) {
    
    let elemToDelete: number;
    
    if(this.shortcuts && this.shortcuts.length > 0) {
      for(let i=0; i < this.shortcuts.length; i++) {
        if(this.shortcuts[i].name === shortcut.name) {
          elemToDelete = i;
        }
      }
    }

    if(elemToDelete !== undefined) {
      this.shortcuts.splice(elemToDelete, 1);
      this.eventAddShortcut.emit(this.shortcuts);
    }
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage():void {
    this.alertMessage = '';
  }
}
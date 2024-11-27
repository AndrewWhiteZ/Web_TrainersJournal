import { Component, OnInit } from '@angular/core';
import { TuiButton, TuiDialogContext } from '@taiga-ui/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TuiAccordion } from '@taiga-ui/kit';
import { injectContext } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/response/api.response';
import { EmptyResponse } from '../../models/response/empty.response';

@Component({
  selector: 'app-list-selection',
  standalone: true,
  imports: [
    TuiAccordion,
    TuiButton,
    ReactiveFormsModule,
  ],
  templateUrl: './list-selection.component.html',
  styleUrl: './list-selection.component.less',
})
export class ListSelectionComponent<T extends { id?: string, name?: string, fullName?: string }> implements OnInit {
  
  public readonly context = injectContext<TuiDialogContext<T | null, Observable<any>>>();

  protected chooseForm = new FormGroup({
    value: new FormControl<T | null>(null)
  });

  protected items: Array<T> = new Array;
  protected selectedItem: T | null = null;

  ngOnInit(): void {
    this.context.data.subscribe({
      next: (next: ApiResponse<Array<T>>) => {
        next.data.map((item) => this.items.push(item));
      },
      error: (error: EmptyResponse) => { this.context.completeWith(null); }
    });
  }
  
  protected selectItem(selectedItem: T) {
    this.selectedItem = selectedItem;
  }

  protected chooseItem(selectedItem?: T | null) {
    if(selectedItem === undefined) {
      console.log(this.selectedItem);
      this.context.completeWith(this.selectedItem);
    } else {
      console.log(selectedItem);
      this.context.completeWith(selectedItem);
    }
  }

}

import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TuiAlertService, TuiAppearance, TuiButton, TuiDialogService, TuiIcon, TuiTextfield, TuiTitle } from '@taiga-ui/core';
import { TUI_CONFIRM, TuiAccordion, TuiAccordionItem, TuiAvatar, TuiButtonGroup, TuiConfirmData } from '@taiga-ui/kit';
import { TuiCardLarge, TuiHeader, TuiSearch } from '@taiga-ui/layout';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [
    TuiAccordion,
    TuiAccordionItem,
    TuiAppearance,
    TuiCardLarge,
    TuiSearch,
    TuiTextfield,
    ReactiveFormsModule,
    TuiButton,
    TuiAvatar,
    TuiHeader,
    TuiTitle,
    TuiButtonGroup,
    TuiIcon,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './group-list.component.html',
  styleUrl: './group-list.component.less'
})
export class GroupListComponent {

  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);

  protected readonly searchForm = new FormGroup({
    search: new FormControl()
  });

  selectedGroup: String | null = null;

  groups = Array("ГД-000001", "ГД-000002", "ГД-000003");
  students = Array("Joanne Martin", "Julio Brown", "Wayne Martin", "Eric Howell", "Dorothy Johnson", "Stanley Harris", "Anna Morgan");

  selectGroup(selectedGroup: String) {
    this.selectedGroup = selectedGroup;
  }

  approveGroupDeletion() {
    const data: TuiConfirmData = {
      content: `Вы действительно хотите удалить группу ${this.selectedGroup}?`,
      yes: 'Да',
      no: 'Отмена',
    };

    this.dialogs
        .open<boolean>(TUI_CONFIRM, {
            label: 'Подтвердите действие',
            size: 's',
            data,
        })
        .pipe(switchMap((response) => this.alerts.open(String(response))))
        .subscribe();
  }

}

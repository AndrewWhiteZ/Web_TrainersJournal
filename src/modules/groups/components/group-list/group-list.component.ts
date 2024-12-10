import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  TuiAlertService,
  TuiAppearance,
  TuiAutoColorPipe,
  TuiButton,
  TuiDialogContext,
  TuiDialogService,
  TuiError,
  TuiTextfield,
  TuiTitle,
} from '@taiga-ui/core';
import {
  TUI_CONFIRM,
  TuiConfirmData,
  TuiFieldErrorPipe,
  TuiPagination,
  TuiSkeleton,
} from '@taiga-ui/kit';
import { TuiCardLarge, TuiCell, TuiHeader, TuiSearch } from '@taiga-ui/layout';
import { GroupEntity } from '../../../../app/shared/models/entity/group.entity';
import { GroupMapper } from '../../../../app/shared/models/mapper/group.mapper';
import type { PolymorpheusContent } from '@taiga-ui/polymorpheus';
import { AsyncPipe } from '@angular/common';
import { TuiInputModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { CreateGroupRequest } from '../../../../app/shared/models/requests/create-group.request';
import { FacadeService } from '../../../../app/shared/services/facade.service';

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [
    TuiAppearance,
    TuiCardLarge,
    TuiSearch,
    TuiTextfield,
    ReactiveFormsModule,
    TuiButton,
    TuiHeader,
    TuiTitle,
    TuiError,
    TuiFieldErrorPipe,
    AsyncPipe,
    TuiInputModule,
    TuiTextfieldControllerModule,
    TuiSkeleton,
    TuiCell,
    TuiAutoColorPipe,
    TuiPagination,
  ],
  templateUrl: './group-list.component.html',
  styleUrl: './group-list.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupListComponent implements OnInit {
  
  protected skeletonGroups: boolean = true;

  protected length = 1;
  protected index = 1;

  protected groups: Array<GroupEntity> = new Array;

  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);

  protected readonly searchForm = new FormGroup({
    search: new FormControl(),
  });

  protected readonly createGroupForm = new FormGroup({
    nameValue: new FormControl('', { validators: [Validators.required], nonNullable: true } ),
  });
  
  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private facadeService: FacadeService,
  ) {}

  ngOnInit(): void {
    this.getGroups();
  }

  protected getGroups() {
    this.skeletonGroups = true;
    this.facadeService.getGroups().subscribe({
      next: (next) => {
        this.groups = new Array;
        next.data.map((dto) => this.groups.push(GroupMapper.mapToEntity(dto)));
        this.skeletonGroups = false;
      },
      error: (response) => this.showAlert("Ошибка", response.error.message, "negative", 5000),
      complete: () => this.cdr.detectChanges()
    });
  }

  protected approveGroupDeletion(group: GroupEntity) {
    const data: TuiConfirmData = { content: `Вы действительно хотите удалить группу <b>${group.name}</b>?`, yes: 'Да', no: 'Отмена' };
    this.dialogs.open<boolean>(TUI_CONFIRM, { label: 'Подтвердите действие', size: 's', data }).subscribe({
      next: () => this.alerts.open('Функционал пока не реализован').subscribe()
    });
  }

  protected changeRoute(route: String) {
    this.router.navigate(['group/', route]);
  }

  protected showDialog(content: PolymorpheusContent<TuiDialogContext>): void {
    this.dialogs.open(content, { label: 'Новая группа' }).subscribe();
  }

  protected createGroup(observer: any) {
    const request: CreateGroupRequest = {
      name: this.createGroupForm.controls.nameValue.value
    };

    this.facadeService.createGroup(request).subscribe({
      next: () => {
        this.showAlert("Успех", `Группа <b>${request.name}</b> успешно создана`, "positive", 3000);
        observer.complete();
        this.cdr.detectChanges();
      },
      error: (response) => { 
        this.showAlert("Ошибка", response.error.message, "negative", 5000);
        this.cdr.detectChanges();
      }
    });
  }

  private showAlert(label: string, data: string, appearance: string, autoClose: number) {
    this.alerts.open(data, { appearance, label, autoClose }).subscribe();
  }
}

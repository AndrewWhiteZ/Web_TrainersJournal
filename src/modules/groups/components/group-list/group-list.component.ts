import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  TuiAlertService,
  TuiAppearance,
  TuiButton,
  TuiDialogContext,
  TuiDialogService,
  TuiError,
  TuiIcon,
  TuiTextfield,
  TuiTitle,
} from '@taiga-ui/core';
import {
  TUI_CONFIRM,
  TuiAccordion,
  TuiAccordionItem,
  TuiAvatar,
  TuiButtonGroup,
  TuiConfirmData,
  TuiFieldErrorPipe,
  TuiSkeleton,
} from '@taiga-ui/kit';
import { TuiCardLarge, TuiHeader, TuiSearch } from '@taiga-ui/layout';
import { switchMap } from 'rxjs';
import { GroupService } from '../../services/group.service';
import { GroupEntity } from '../../../../app/shared/models/entity/group.entity';
import { GroupMapper } from '../../../../app/shared/models/mapper/group.mapper';
import type { PolymorpheusContent } from '@taiga-ui/polymorpheus';
import { AsyncPipe } from '@angular/common';
import { TuiInputModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { CreateGroupRequest } from '../../../../app/shared/models/requests/create-group.request';

@Component({
    selector: 'app-group-list',
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
        TuiError,
        TuiFieldErrorPipe,
        AsyncPipe,
        TuiInputModule,
        TuiTextfieldControllerModule,
        TuiSkeleton,
    ],
    templateUrl: './group-list.component.html',
    styleUrl: './group-list.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupListComponent implements OnInit {
  
  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);

  constructor(
    private router: Router,
    private groupService: GroupService,
    private cdr: ChangeDetectorRef,
  ) {}

  protected skeletonGroups: boolean = true;

  protected groups: Array<GroupEntity> = new Array();
  protected selectedGroup: GroupEntity | null = null;

  protected readonly createGroupForm = new FormGroup({
    nameValue: new FormControl('', { validators: [Validators.required], nonNullable: true } ),
  });

  protected readonly searchForm = new FormGroup({
    search: new FormControl(),
  });

  ngOnInit(): void {
    this.getGroups();
  }

  private getGroups() {
    this.skeletonGroups = true;
    this.groupService.getGroups().subscribe({
      next: (next) => {
        this.groups = new Array;
        next.data.map((groupDto) => this.groups.push(GroupMapper.mapToEntity(groupDto)));
        this.skeletonGroups = false;
        this.cdr.detectChanges();
      },
    });
  }

  selectGroup(selectedGroup: GroupEntity) {
    this.selectedGroup = selectedGroup;
  }

  approveGroupDeletion() {
    const data: TuiConfirmData = {
      content: `Вы действительно хотите удалить группу <b>${this.selectedGroup?.name}</b>?`,
      yes: 'Да',
      no: 'Отмена',
    };

    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: 'Подтвердите действие',
        size: 's',
        data,
      })
      .subscribe({
        next: () => this.deleteGroup() 
      });
  }

  private deleteGroup() {
    this.alerts.open('Not implemented yet').subscribe();
  }

  changeRoute(route: String) {
    this.router.navigate(['group/', route]);
  }

  protected showDialog(content: PolymorpheusContent<TuiDialogContext>): void {
    this.dialogs.open(content, { label: 'Новая группа' }).subscribe();
  }

  createGroup(observer: any) {
    const request: CreateGroupRequest = {
      name: this.createGroupForm.controls.nameValue.value
    };

    this.groupService.createGroup(request).subscribe({
      next: () => {
        this.alerts.open(`Группа <b>${request.name}</b> успешно создана`, { autoClose: 3000, label: 'Успех', appearance: 'positive' }).subscribe();
        observer.complete();
      },
      error: (error) => this.alerts.open(error, { autoClose: 5000, label: 'Ошибка', appearance: 'negative' }).subscribe(),
    });
  }
}

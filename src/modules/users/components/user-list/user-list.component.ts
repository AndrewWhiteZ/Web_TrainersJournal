import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { TuiAlertService, TuiDialogService } from '@taiga-ui/core';
import { UserEntity } from '../../../../app/shared/models/entity/user.entity';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-user-list',
    imports: [],
    templateUrl: './user-list.component.html',
    styleUrl: './user-list.component.less'
})
export class UserListComponent implements OnInit {
    
    private readonly dialogs = inject(TuiDialogService);
    private readonly alerts = inject(TuiAlertService);
  
    protected skeletonUsers: boolean = true;

    protected users: Array<UserEntity> = new Array;

    constructor(
        private userService: UserService,
        private cdr: ChangeDetectorRef
    ) {}
    
    ngOnInit(): void {
        this.getUsers()
    }

    private getUsers() {
        this.skeletonUsers = true;
        this.cdr.detectChanges();
    };
}

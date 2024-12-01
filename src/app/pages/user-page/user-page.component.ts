import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { User } from '../../interfaces/user';
import { RouterModule } from '@angular/router';
import { UserParams } from '../../interfaces/user-params';
import { Pagination } from '../../interfaces/pagination';
import { PaginatedResult } from '../../interfaces/paginated-result';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { UserCardComponent } from '../../components/user-card/user-card.component';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-user-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DropdownModule,
    InputNumberModule,
    ButtonModule,
    PaginatorModule,
    RouterModule,
    TooltipModule,
    CardModule,
    UserCardComponent,
  ],
  templateUrl: './user-page.component.html',
  styles: ``,
})
export class UserPageComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private destroy$ = new Subject<void>();

  users: User[] = [];
  userParams: UserParams = this.userService.userParams;
  userPagination: Pagination = this.getPagination();

  filterForm: FormGroup = new FormGroup({});
  genderOptions = [
    { label: 'Masculino', value: 'male' },
    { label: 'Femenino', value: 'female' },
  ];
  debounceTime = 1000;

  ngOnInit(): void {
    this.initializeForm();
    this.setupFormSubscription();
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getPagination(): Pagination {
    return (
      this.userService.paginatedResult()?.pagination || {
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 0,
        totalPages: 0,
      }
    );
  }

  initializeForm(): void {
    this.filterForm = this.fb.group({
      minAge: [
        this.userParams.minAge,
        [Validators.required, Validators.min(18)],
      ],
      maxAge: [
        this.userParams.maxAge,
        [Validators.required, this.ageRangeValidator('minAge')],
      ],
      gender: [this.userParams.gender, [Validators.required]],
    });

    this.filterForm.controls['minAge'].valueChanges.subscribe({
      next: () => {
        this.filterForm.controls['maxAge'].updateValueAndValidity();
      },
    });
  }

  ageRangeValidator(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      return control.parent?.get(matchTo)?.value <= control.value
        ? null
        : { ageRange: true };
    };
  }

  setupFormSubscription(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(this.debounceTime),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (formValue) => {
          if (this.filterForm.valid) {
            this.userParams = {
              ...this.userParams,
              ...formValue,
              pageNumber: 1,
            };

            this.userService.setUserParams(this.userParams);
            this.loadUsers();
          }
        },
      });
  }

  loadUsers(): void {
    this.userService.setUserParams(this.userParams);

    this.userService
      .getUsers()
      .subscribe((paginatedResult: PaginatedResult<User[]>) => {
        if (paginatedResult) {
          this.users = paginatedResult.result || [];

          this.userPagination.currentPage =
            paginatedResult.pagination?.currentPage || 1;
          this.userPagination.itemsPerPage =
            paginatedResult.pagination?.itemsPerPage || 10;
          this.userPagination.totalItems =
            paginatedResult.pagination?.totalItems || 0;

          this.userPagination.totalPages =
            paginatedResult.pagination?.totalPages || 0;
        }
      });
  }

  resetFilters(): void {
    this.userService.resetUserParams();
    this.userParams = this.userService.userParams;
    this.filterForm.reset(this.userParams);
    this.loadUsers();
  }

  onSubmit(): void {
    if (this.filterForm.invalid) return;

    this.userParams = {
      ...this.userParams,
      ...this.filterForm.value,
    };

    this.userService.setUserParams(this.userParams);
    this.loadUsers();
  }

  onPageChange(event: PaginatorState) {
    if (event.first !== undefined && event.rows !== undefined) {
      const pageNumber = Math.floor(event.first / event.rows) + 1;

      this.userParams = {
        ...this.userParams,
        pageNumber: pageNumber,
        pageSize: event.rows,
      };

      this.userService.setUserParams(this.userParams);
      this.loadUsers();
    }
  }
}

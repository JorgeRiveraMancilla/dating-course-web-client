import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { PaginatorState, PaginatorModule } from 'primeng/paginator';
import { UserCardComponent } from '../../components/user-card/user-card.component';
import { Pagination } from '../../interfaces/pagination';
import { User } from '../../interfaces/user';
import { UserParams } from '../../interfaces/user-params';
import { FormValidatorService } from '../../services/form-validator.service';
import { UserService } from '../../services/user.service';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    DropdownModule,
    InputNumberModule,
    ButtonModule,
    PaginatorModule,
    TooltipModule,
    CardModule,
    UserCardComponent,
  ],
  templateUrl: './user-page.component.html',
})
export class UserPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly validatorService = inject(FormValidatorService);

  protected users: User[] = [];
  protected userParams?: UserParams;
  protected pagination: Pagination = this.getDefaultPagination();
  protected loading = false;

  protected readonly filterForm: FormGroup = this.initializeForm();
  protected readonly genderOptions = [
    { label: 'Masculino', value: 'male' },
    { label: 'Femenino', value: 'female' },
  ];
  protected readonly debounceMilliseconds = environment.debounceMilliseconds;

  ngOnInit(): void {
    this.initializeUserParams();
    this.setupFormSubscription();
    this.loadUsers();
  }

  // Protected Methods
  protected onSubmit(): void {
    if (this.filterForm.invalid) return;

    const formValue = this.filterForm.value;
    this.updateUserParams({
      ...formValue,
      pageNumber: 1,
      pageSize: this.pagination.itemsPerPage,
    });
    this.loadUsers();
  }

  protected resetFilters(): void {
    const auth = this.authService.getCurrentAuth();
    if (!auth) return;

    const resetParams = this.userService.resetUserParams();
    if (resetParams) {
      this.userParams = {
        ...resetParams,
        pageNumber: 1,
        pageSize: this.pagination.itemsPerPage,
      };
      this.filterForm.reset(resetParams);
      this.userService.setUserParams(this.userParams);
      this.loadUsers();
    }
  }

  protected onPageChange(event: PaginatorState): void {
    if (event.first === undefined || event.rows === undefined) return;

    const pageNumber = Math.floor(event.first / event.rows) + 1;

    this.updateUserParams({
      pageNumber,
      pageSize: event.rows,
    });

    this.loadUsers();
  }

  // Private Methods
  private initializeUserParams(): void {
    const currentParams = this.userService.getUserParams();
    if (currentParams) {
      this.userParams = currentParams;
      this.filterForm.patchValue(
        {
          minAge: currentParams.minAge,
          maxAge: currentParams.maxAge,
          gender: currentParams.gender,
        },
        { emitEvent: false }
      );
    }
  }

  private getDefaultPagination(): Pagination {
    return {
      currentPage: 1,
      itemsPerPage: 12,
      totalItems: 0,
      totalPages: 0,
    };
  }

  private initializeForm(): FormGroup {
    return this.fb.group(
      {
        minAge: [18, [Validators.required, Validators.min(18)]],
        maxAge: [
          99,
          [
            Validators.required,
            Validators.min(18),
            this.validatorService.ageRangeValidator('minAge'),
          ],
        ],
        gender: ['female', [Validators.required]],
      },
      { updateOn: 'blur' }
    );
  }

  private setupFormSubscription(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(this.debounceMilliseconds),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        )
      )
      .subscribe(() => {
        if (this.filterForm.valid) {
          const formValue = this.filterForm.value;
          this.updateUserParams({
            ...formValue,
            pageNumber: 1,
            pageSize: this.pagination.itemsPerPage,
          });
          this.loadUsers();
        }
      });
  }

  private updateUserParams(updates: Partial<UserParams>): void {
    if (!this.userParams) return;

    this.userParams = { ...this.userParams, ...updates };
    this.userService.setUserParams(this.userParams);
  }

  private loadUsers(): void {
    if (this.loading) return;

    this.loading = true;

    this.userService.getUsers().subscribe({
      next: (paginatedResult) => {
        if (paginatedResult) {
          this.users = paginatedResult.result;
          this.pagination = paginatedResult.pagination;
        }
      },
      error: (error) => console.error('Error loading users:', error),
      complete: () => (this.loading = false),
    });
  }
}

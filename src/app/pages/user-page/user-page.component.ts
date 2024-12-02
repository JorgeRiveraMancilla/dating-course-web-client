import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
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
export class UserPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly validatorService = inject(FormValidatorService);

  protected users: User[] = [];
  protected userParams: UserParams =
    this.userService.getUserParams() || ({} as UserParams);
  protected pagination: Pagination = this.getDefaultPagination();

  protected readonly filterForm: FormGroup = this.initializeForm();
  protected readonly genderOptions = [
    { label: 'Masculino', value: 'male' },
    { label: 'Femenino', value: 'female' },
  ];
  protected readonly debounceMilliseconds = environment.debounceMilliseconds;

  constructor() {
    this.setupFormSubscription();
    this.loadUsers();
  }

  // Public Methods
  protected onSubmit(): void {
    if (this.filterForm.invalid) return;
    this.updateUserParams(this.filterForm.value);
    this.loadUsers();
  }

  protected resetFilters(): void {
    const resetParams = this.userService.resetUserParams();
    if (resetParams) {
      this.userParams = resetParams;
      this.filterForm.reset(resetParams);
      this.loadUsers();
    }
  }

  protected onPageChange(event: PaginatorState): void {
    if (event.first === undefined || event.rows === undefined) return;

    const pageNumber = Math.floor(event.first / event.rows) + 1;
    this.updateUserParams({ pageNumber, pageSize: event.rows });
    this.loadUsers();
  }

  // Private Methods
  private getDefaultPagination(): Pagination {
    return (
      this.userService.getPaginatedResult()?.pagination || {
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 0,
        totalPages: 0,
      }
    );
  }

  private initializeForm(): FormGroup {
    const form = this.fb.group({
      minAge: [
        this.userParams.minAge,
        [Validators.required, Validators.min(18)],
      ],
      maxAge: [
        this.userParams.maxAge,
        [
          Validators.required,
          this.validatorService.ageRangeValidator('minAge'),
        ],
      ],
      gender: [this.userParams.gender, [Validators.required]],
    });

    // Actualizar validación de maxAge cuando cambie minAge
    form.get('minAge')?.valueChanges.subscribe(() => {
      form.get('maxAge')?.updateValueAndValidity();
    });

    return form;
  }

  private setupFormSubscription(): void {
    this.filterForm.valueChanges
      .pipe(debounceTime(this.debounceMilliseconds), distinctUntilChanged())
      .subscribe((formValue) => {
        if (this.filterForm.valid) {
          this.updateUserParams({ ...formValue, pageNumber: 1 });
          this.loadUsers();
        }
      });
  }

  private updateUserParams(updates: Partial<UserParams>): void {
    this.userParams = { ...this.userParams, ...updates };
    this.userService.setUserParams(this.userParams);
  }

  private loadUsers(): void {
    this.userService.getUsers(this.userParams).subscribe({
      next: (paginatedResult) => {
        if (paginatedResult) {
          this.users = paginatedResult.result || [];
          this.pagination =
            paginatedResult.pagination || this.getDefaultPagination();
        }
      },
      error: (error) => console.error('Error loading users:', error),
    });
  }
}

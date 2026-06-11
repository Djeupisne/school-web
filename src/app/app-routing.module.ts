import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

const routes: Routes = [
  { path: 'login', loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule) },
  { path: 'dashboard', loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule), canActivate: [authGuard] },
  { path: 'students', loadChildren: () => import('./modules/students/students.module').then(m => m.StudentsModule), canActivate: [roleGuard], data: { roles: ['ADMIN', 'TEACHER'] } },
  { path: 'grades', loadChildren: () => import('./modules/grades/grades.module').then(m => m.GradesModule), canActivate: [roleGuard], data: { roles: ['ADMIN', 'TEACHER'] } },
  { path: 'schedule', loadChildren: () => import('./modules/schedule/schedule.module').then(m => m.ScheduleModule), canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'staff', loadChildren: () => import('./modules/staff/staff.module').then(m => m.StaffModule), canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { StudentListComponent } from './student-list/student-list.component';
import { StudentFormComponent } from './student-form/student-form.component';

const routes: Routes = [
  { path: '', component: StudentListComponent },
  { path: 'new', component: StudentFormComponent }
];

@NgModule({
  declarations: [StudentListComponent, StudentFormComponent],
  imports: [CommonModule, FormsModule, SharedModule, RouterModule.forChild(routes)]
})
export class StudentsModule { }
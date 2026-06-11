import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { StaffComponent } from './staff.component';

const routes: Routes = [{ path: '', component: StaffComponent }];

@NgModule({
  declarations: [StaffComponent],
  imports: [
    CommonModule,
    FormsModule,  // <-- AJOUTÉ
    RouterModule.forChild(routes)
  ]
})
export class StaffModule { }
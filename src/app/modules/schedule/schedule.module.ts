import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ScheduleComponent } from './schedule.component';

const routes: Routes = [{ path: '', component: ScheduleComponent }];

@NgModule({
  declarations: [ScheduleComponent],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes)]
})
export class ScheduleModule { }
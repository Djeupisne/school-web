import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { GradeEntryComponent } from './grade-entry/grade-entry.component';
import { BulletinComponent } from './bulletin/bulletin.component';

const routes: Routes = [
  { path: 'entry', component: GradeEntryComponent },
  { path: 'bulletin', component: BulletinComponent },
  { path: 'bulletin/:id', component: BulletinComponent }
];

@NgModule({
  declarations: [GradeEntryComponent, BulletinComponent],
  imports: [CommonModule, FormsModule, SharedModule, RouterModule.forChild(routes)]
})
export class GradesModule { }
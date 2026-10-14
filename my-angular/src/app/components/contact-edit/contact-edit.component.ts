import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Group } from '../../models/models';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

@Component({
  selector: 'app-contact-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './contact-edit.component.html',
  styleUrls: ['./contact-edit.component.css']
})
export class ContactEditComponent implements OnInit {
  id: string | null = null;
  groups: Group[] = [];
  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.pattern(EMAIL)]],
    phone: [''],
    groupId: ['']
  });
  saving = false;

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router, private api: ApiService) {}

  ngOnInit(){
    this.api.listGroups().subscribe(gs => this.groups = gs);
    this.route.paramMap.subscribe(params => {
      const pid = params.get('id');
      this.id = pid && pid !== 'new' ? pid : null;
      if (this.id){ this.api.getContact(this.id).subscribe(found => {
        this.form.patchValue({
          name: (found as any).name ?? '',
          email: (found as any).email ?? '',
          phone: (found as any).phone ?? '',
          groupId: (found as any).groupId ?? ''
        });
      }); }
    });
  }
  submit(){
    if (this.form.invalid){ this.form.markAllAsTouched(); return; }
    this.saving = true;
    const v = this.form.value as any;
    const payload = { name: v.name, email: v.email || null, phone: v.phone || null, groupId: v.groupId || null };
    const obs = this.id ? this.api.updateContact(this.id, payload) : this.api.createContact(payload);
    obs.subscribe({
      next: () => { this.saving=false; this.router.navigate(['/contacts']); },
      error: () => { this.saving=false; }
    });
  }
  cancel(){ this.router.navigate(['/contacts']); }
}

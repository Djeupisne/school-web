import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { DashboardService, DashboardStats, GradeBySubject, RecentActivity, Alert } from '../../core/services/dashboard.service';
import { Subscription, interval } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats: DashboardStats = {
    students: 0,
    teachers: 0,
    grades: 0,
    payments: 0,
    totalRevenue: 0,
    pendingPayments: 0
  };

  recentActivity: RecentActivity[] = [];
  alerts: Alert[] = [];
  loading = true;
  currentDate = new Date();
  greeting = '';

  private refreshSubscription!: Subscription;

  // Configuration du graphique en barres
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 20,
        grid: { color: '#f1f5f9' },
        ticks: { color: '#64748b' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#64748b' }
      }
    }
  };

  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Moyenne / 20',
      backgroundColor: '#4f46e5',
      borderRadius: 8,
      barThickness: 32
    }]
  };

  // Configuration du graphique en donut
public doughnutChartOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: { padding: 15, font: { size: 12 }, color: '#64748b' }
    }
  }
};

  public doughnutChartData: ChartData<'doughnut'> = {
    labels: ['Excellent (≥16)', 'Bien (14-16)', 'Moyen (10-14)', 'Insuffisant (<10)'],
    datasets: [{
      data: [0, 0, 0, 0],
      backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
      borderWidth: 0
    }]
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.setGreeting();
    this.loadDashboard();

    // Rafraîchissement automatique toutes les 30 secondes
    this.refreshSubscription = interval(30000).subscribe(() => {
      this.loadDashboard();
    });
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  setGreeting() {
    const hour = this.currentDate.getHours();
    if (hour < 12) this.greeting = 'Bonjour';
    else if (hour < 18) this.greeting = 'Bon après-midi';
    else this.greeting = 'Bonsoir';
  }

  loadDashboard() {
    this.dashboardService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: () => this.loading = false
    });

    this.dashboardService.getGradesBySubject().subscribe(grades => {
      if (grades.length > 0) {
        this.barChartData.labels = grades.map(g => g.subject);
        this.barChartData.datasets[0].data = grades.map(g => Math.round(g.average * 100) / 100);

        // Calculer la répartition des niveaux
        const excellent = grades.filter(g => g.average >= 16).length;
        const bien = grades.filter(g => g.average >= 14 && g.average < 16).length;
        const moyen = grades.filter(g => g.average >= 10 && g.average < 14).length;
        const insuffisant = grades.filter(g => g.average < 10).length;

        this.doughnutChartData.datasets[0].data = [excellent, bien, moyen, insuffisant];
      }
    });

    this.dashboardService.getRecentActivity().subscribe(activity => {
      this.recentActivity = activity;
    });

    this.dashboardService.getAlerts().subscribe(alerts => {
      this.alerts = alerts;
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  }

  timeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  }
}
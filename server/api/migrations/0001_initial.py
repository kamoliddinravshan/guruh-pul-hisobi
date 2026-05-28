from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="User",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=160)),
                ("email", models.EmailField(blank=True, max_length=254, null=True, unique=True)),
                ("password_hash", models.CharField(blank=True, max_length=255, null=True)),
                ("google_id", models.CharField(blank=True, max_length=255, null=True, unique=True)),
                ("avatar_url", models.URLField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name="Group",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=160)),
                ("description", models.TextField(blank=True)),
                ("members", models.JSONField(default=list)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("created_by", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="created_groups", to="api.user")),
            ],
        ),
        migrations.CreateModel(
            name="Expense",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=180)),
                ("amount", models.DecimalField(decimal_places=2, max_digits=14)),
                ("payer", models.CharField(max_length=160)),
                ("participants", models.JSONField(default=list)),
                ("category", models.CharField(blank=True, max_length=80)),
                ("description", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("group", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="expenses", to="api.group")),
            ],
        ),
        migrations.CreateModel(
            name="Settlement",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("from_member", models.CharField(max_length=160)),
                ("to_member", models.CharField(max_length=160)),
                ("amount", models.DecimalField(decimal_places=2, max_digits=14)),
                ("paid_at", models.DateTimeField(auto_now_add=True)),
                ("group", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="settlements", to="api.group")),
            ],
        ),
    ]

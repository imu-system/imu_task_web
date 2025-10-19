/**
 * Task Templates Component
 * Affiche les templates pré-remplis par catégorie
 */

'use client';

import { useState } from 'react';
import { 
  ServiceCategory, 
  TASK_TEMPLATES, 
  TaskTemplate,
  SERVICE_CATEGORIES 
} from '@/types/services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  Euro, 
  ArrowRight,
  Sparkles,
  Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskTemplatesProps {
  category?: ServiceCategory;
  onSelectTemplate: (template: TaskTemplate) => void;
  className?: string;
}

export function TaskTemplates({
  category,
  onSelectTemplate,
  className,
}: TaskTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);

  // Filtrer les templates par catégorie si spécifiée
  const templates = category
    ? TASK_TEMPLATES.filter(t => t.category === category)
    : TASK_TEMPLATES;

  // Grouper par catégorie si aucune catégorie spécifiée
  const groupedTemplates = category
    ? { [category]: templates }
    : templates.reduce((acc, template) => {
        if (!acc[template.category]) {
          acc[template.category] = [];
        }
        acc[template.category].push(template);
        return acc;
      }, {} as Record<ServiceCategory, TaskTemplate[]>);

  const handleSelect = (template: TaskTemplate) => {
    setSelectedTemplate(template);
    onSelectTemplate(template);
  };

  if (templates.length === 0) {
    return (
      <div className={cn('text-center p-8 text-muted-foreground', className)}>
        <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Aucun template disponible pour cette catégorie</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)} data-testid="task-templates">
      {Object.entries(groupedTemplates).map(([cat, temps]) => {
        const categoryMeta = SERVICE_CATEGORIES[cat as ServiceCategory];
        
        return (
          <div key={cat} className="space-y-3">
            {!category && (
              <>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{categoryMeta.name}</h3>
                  <Badge variant="secondary">{temps.length}</Badge>
                </div>
                <Separator />
              </>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {temps.map((template, idx) => (
                <Card
                  key={`${template.category}-${idx}`}
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-md',
                    selectedTemplate === template && 'ring-2 ring-primary'
                  )}
                  onClick={() => handleSelect(template)}
                  data-testid={`template-card-${template.category}-${idx}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{template.title}</CardTitle>
                      <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                    </div>
                    <CardDescription className="text-sm">
                      {template.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Tags */}
                    {template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {template.tags.map((tag, tagIdx) => (
                          <Badge
                            key={tagIdx}
                            variant="outline"
                            className="text-xs"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Prix et durée suggérés */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{Math.floor(template.suggestedDuration / 60)}h{template.suggestedDuration % 60 > 0 ? (template.suggestedDuration % 60).toString().padStart(2, '0') : ''}</span>
                      </div>
                      <div className="flex items-center gap-1 font-semibold text-primary">
                        <Euro className="h-4 w-4" />
                        <span>{template.suggestedPrice}€</span>
                      </div>
                    </div>

                    <Button
                      variant={selectedTemplate === template ? 'default' : 'outline'}
                      size="sm"
                      className="w-full gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(template);
                      }}
                    >
                      Utiliser ce template
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Template Quick Picker - Variante compacte pour modal/sidebar
 */
interface TemplateQuickPickerProps {
  category: ServiceCategory;
  onSelect: (template: TaskTemplate) => void;
  className?: string;
}

export function TemplateQuickPicker({
  category,
  onSelect,
  className,
}: TemplateQuickPickerProps) {
  const templates = TASK_TEMPLATES.filter(t => t.category === category);

  return (
    <ScrollArea className={cn('h-[400px] pr-4', className)} data-testid="template-quick-picker">
      <div className="space-y-2">
        {templates.map((template, idx) => (
          <Card
            key={idx}
            className="cursor-pointer hover:bg-accent transition-colors"
            onClick={() => onSelect(template)}
            data-testid={`template-quick-${idx}`}
          >
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-sm">{template.title}</h4>
                  <Badge variant="secondary" className="ml-2 flex-shrink-0">
                    {template.suggestedPrice}€
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {template.description}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {Math.floor(template.suggestedDuration / 60)}h
                  </span>
                  {template.tags.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {template.tags.length} tags
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}

/**
 * Template Preview - Affichage détaillé d'un template
 */
interface TemplatePreviewProps {
  template: TaskTemplate;
  onUse: () => void;
  className?: string;
}

export function TemplatePreview({
  template,
  onUse,
  className,
}: TemplatePreviewProps) {
  const categoryMeta = SERVICE_CATEGORIES[template.category];

  return (
    <Card className={cn('', className)} data-testid="template-preview">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">{categoryMeta.name}</Badge>
          <Sparkles className="h-4 w-4" />
          <span>Template pré-rempli</span>
        </div>
        <CardTitle>{template.title}</CardTitle>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Détails */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Durée suggérée</p>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold">
                {Math.floor(template.suggestedDuration / 60)}h
                {template.suggestedDuration % 60 > 0 ? ` ${template.suggestedDuration % 60}min` : ''}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Prix suggéré</p>
            <div className="flex items-center gap-2">
              <Euro className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold">{template.suggestedPrice}€</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {template.tags.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Tags associés</p>
            <div className="flex flex-wrap gap-2">
              {template.tags.map((tag, idx) => (
                <Badge key={idx} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Action button */}
        <Button onClick={onUse} className="w-full gap-2">
          <Sparkles className="h-4 w-4" />
          Utiliser ce template
          <ArrowRight className="h-4 w-4" />
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Vous pourrez modifier tous les détails après sélection
        </p>
      </CardContent>
    </Card>
  );
}

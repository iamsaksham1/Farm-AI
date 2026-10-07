"""
AgriVision - Model Training Script (Transfer Learning)
Architecture: MobileNetV2 with Custom PlantVillage Classifier Head (38 Classes)
Dataset: PlantVillage (https://www.kaggle.com/datasets/emmarex/plantdisease)

Usage:
  python train.py --data_dir /path/to/plantvillage_dataset --epochs 15 --batch_size 32 --lr 0.001 --output_dir ./weights
"""

import os
import argparse
import time
import copy
import torch
import torch.nn as nn
import torch.optim as optim
from torch.optim import lr_scheduler
from torchvision import datasets, models, transforms

def parse_args():
    parser = argparse.ArgumentParser(description="AgriVision Plant Disease Classifier Training")
    parser.add_argument("--data_dir", type=str, default="./data/plantvillage", help="Root directory containing train/ and val/ folders")
    parser.add_argument("--epochs", type=int, default=15, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=32, help="Mini-batch size")
    parser.add_argument("--lr", type=float, default=1e-3, help="Initial learning rate")
    parser.add_argument("--output_dir", type=str, default="./weights", help="Directory to save trained model checkpoint")
    return parser.parse_args()

def get_data_transforms():
    return {
        "train": transforms.Compose([
            transforms.RandomResizedCrop(224, scale=(0.8, 1.0)),
            transforms.RandomHorizontalFlip(),
            transforms.RandomRotation(15),
            transforms.ColorJitter(brightness=0.1, contrast=0.1, saturation=0.1),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
        "val": transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
    }

def train_model(model, criterion, optimizer, scheduler, dataloaders, dataset_sizes, device, num_epochs=15):
    since = time.time()
    best_model_wts = copy.deepcopy(model.state_dict())
    best_acc = 0.0

    for epoch in range(num_epochs):
        print(f"Epoch {epoch+1}/{num_epochs}")
        print("-" * 15)

        for phase in ["train", "val"]:
            if phase == "train":
                model.train()
            else:
                model.eval()

            running_loss = 0.0
            running_corrects = 0

            for inputs, labels in dataloaders[phase]:
                inputs = inputs.to(device)
                labels = labels.to(device)

                optimizer.zero_grad()

                with torch.set_grad_enabled(phase == "train"):
                    outputs = model(inputs)
                    _, preds = torch.max(outputs, 1)
                    loss = criterion(outputs, labels)

                    if phase == "train":
                        loss.backward()
                        optimizer.step()

                running_loss += loss.item() * inputs.size(0)
                running_corrects += torch.sum(preds == labels.data)

            if phase == "train" and scheduler:
                scheduler.step()

            epoch_loss = running_loss / dataset_sizes[phase]
            epoch_acc = running_corrects.double() / dataset_sizes[phase]

            print(f"{phase.capitalize()} Loss: {epoch_loss:.4f} Acc: {epoch_acc*100:.2f}%")

            if phase == "val" and epoch_acc > best_acc:
                best_acc = epoch_acc
                best_model_wts = copy.deepcopy(model.state_dict())

        print()

    time_elapsed = time.time() - since
    print(f"Training completed in {time_elapsed // 60:.0f}m {time_elapsed % 60:.0f}s")
    print(f"Best Validation Accuracy: {best_acc*100:.2f}%")

    model.load_state_dict(best_model_wts)
    return model

def main():
    args = parse_args()
    device = torch.device("cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu")
    print(f"AgriVision Training initialized on device: {device}")

    os.makedirs(args.output_dir, exist_ok=True)
    transforms_dict = get_data_transforms()

    if not os.path.exists(args.data_dir):
        print(f"[NOTE] Dataset directory '{args.data_dir}' not found.")
        print("To train from scratch:")
        print("1. Download PlantVillage dataset (38 classes).")
        print("2. Structure folders as data/train/ and data/val/.")
        print("3. Re-run: python train.py --data_dir ./data --epochs 15")
        return

    image_datasets = {x: datasets.ImageFolder(os.path.join(args.data_dir, x), transforms_dict[x]) for x in ["train", "val"]}
    dataloaders = {x: torch.utils.data.DataLoader(image_datasets[x], batch_size=args.batch_size, shuffle=(x == "train"), num_workers=4) for x in ["train", "val"]}
    dataset_sizes = {x: len(image_datasets[x]) for x in ["train", "val"]}
    num_classes = len(image_datasets["train"].classes)
    print(f"Dataset loaded: {dataset_sizes['train']} train images, {dataset_sizes['val']} val images across {num_classes} classes.")

    # Load MobileNetV2 pretrained backbone
    model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)
    
    # Freeze initial feature extractor layers for fast transfer learning
    for param in model.features[:10].parameters():
        param.requires_grad = False

    # Replace classifier head with 38-class head
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, 512),
        nn.ReLU(),
        nn.Dropout(p=0.2),
        nn.Linear(512, num_classes)
    )
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(filter(lambda p: p.requires_grad, model.parameters()), lr=args.lr, weight_decay=1e-4)
    exp_lr_scheduler = lr_scheduler.CosineAnnealingLR(optimizer, T_max=args.epochs)

    trained_model = train_model(model, criterion, optimizer, exp_lr_scheduler, dataloaders, dataset_sizes, device, num_epochs=args.epochs)
    
    save_path = os.path.join(args.output_dir, "mobilenet_v2_plantvillage_custom.pth")
    torch.save(trained_model.state_dict(), save_path)
    print(f"Trained model saved to: {save_path}")

if __name__ == "__main__":
    main()
